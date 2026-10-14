/**
 * Recording what was spent, and reading a group's timeline back.
 *
 * The split is resolved once, here, and stored as one row per participant.
 * Later edits to the group (someone leaves, someone is renamed) therefore
 * cannot retroactively change what a past expense meant.
 */

import type { FastifyInstance } from 'fastify';
import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import {
  buildExpenseLines,
  createExpenseSchema,
  updateExpenseSchema,
  SplitError,
  type Expense,
  type ExpenseParticipant,
} from '@zbhaga/shared';
import { getDb } from '../db/client.ts';
import { expenseParticipants, expenses, groups, users } from '../db/schema.ts';
import { currentUser } from '../auth/plugin.ts';
import { badRequest, forbidden, notFound } from '../lib/errors.ts';
import { parseBody } from '../lib/validate.ts';
import { assertMemberOfGroup, requireMembership, type GroupContext } from '../lib/groups.ts';

const PAGE_SIZE = 50;

const encodeCursor = (spentAt: Date, id: string) =>
  Buffer.from(`${spentAt.toISOString()}|${id}`).toString('base64url');

function decodeCursor(cursor: string): { spentAt: Date; id: string } {
  const [time, id] = Buffer.from(cursor, 'base64url').toString('utf8').split('|');
  const spentAt = new Date(time ?? '');
  if (!id || Number.isNaN(spentAt.getTime())) throw badRequest('That page cursor is not valid.');
  return { spentAt, id };
}

export default async function expenseRoutes(app: FastifyInstance): Promise<void> {
  const db = await getDb();
  app.addHook('preHandler', app.requireAuth);

  app.post<{ Params: { groupId: string } }>(
    '/groups/:groupId/expenses',
    async (request, reply) => {
      const me = currentUser(request);
      const context = await requireMembership(db, request.params.groupId, me.id);
      const body = parseBody(createExpenseSchema, request.body);

      const lines = resolveLines(context, body);

      const created = await db.transaction(async (tx) => {
        const [row] = await tx
          .insert(expenses)
          .values({
            groupId: context.group.id,
            description: body.description.trim(),
            category: body.category?.trim(),
            notes: body.notes?.trim(),
            totalMinor: body.totalMinor,
            currency: context.group.currency,
            splitMode: body.split.mode,
            spentAt: body.spentAt ? new Date(body.spentAt) : new Date(),
            createdBy: me.id,
          })
          .returning();

        if (!row) throw badRequest('That expense could not be saved.');

        await tx
          .insert(expenseParticipants)
          .values(
            lines.map((line) => ({
              expenseId: row.id,
              userId: line.userId,
              paidMinor: line.paidMinor,
              owedMinor: line.owedMinor,
            })),
          );

        // Keep the group list sorted by real activity.
        await tx.update(groups).set({ updatedAt: new Date() }).where(eq(groups.id, context.group.id));

        return row;
      });

      reply.code(201);
      return loadExpense(db, context, created.id);
    },
  );

  /** The group timeline, newest first, cursor paginated. */
  app.get<{ Params: { groupId: string }; Querystring: { cursor?: string; limit?: string } }>(
    '/groups/:groupId/expenses',
    async (request) => {
      const me = currentUser(request);
      const context = await requireMembership(db, request.params.groupId, me.id);

      const limit = Math.min(Math.max(Number(request.query.limit ?? PAGE_SIZE) || PAGE_SIZE, 1), 100);
      const conditions = [eq(expenses.groupId, context.group.id), isNull(expenses.deletedAt)];

      if (request.query.cursor) {
        const { spentAt, id } = decodeCursor(request.query.cursor);
        // Row comparison keeps the keyset stable when several expenses share a timestamp.
        conditions.push(
          sql`(${expenses.spentAt}, ${expenses.id}) < (${spentAt.toISOString()}::timestamptz, ${id}::uuid)`,
        );
      }

      // One extra row tells us whether another page exists.
      const rows = await db
        .select()
        .from(expenses)
        .where(and(...conditions))
        .orderBy(desc(expenses.spentAt), desc(expenses.id))
        .limit(limit + 1);

      const page = rows.slice(0, limit);
      const last = page.at(-1);

      const participants = await loadParticipants(db, page.map((r) => r.id));

      return {
        items: page.map((row) => toExpense(row, participants.get(row.id) ?? [])),
        nextCursor: rows.length > limit && last ? encodeCursor(last.spentAt, last.id) : null,
      };
    },
  );

  app.get<{ Params: { groupId: string; expenseId: string } }>(
    '/groups/:groupId/expenses/:expenseId',
    async (request) => {
      const me = currentUser(request);
      const context = await requireMembership(db, request.params.groupId, me.id);
      return loadExpense(db, context, request.params.expenseId);
    },
  );

  app.patch<{ Params: { groupId: string; expenseId: string } }>(
    '/groups/:groupId/expenses/:expenseId',
    async (request) => {
      const me = currentUser(request);
      const context = await requireMembership(db, request.params.groupId, me.id);
      const body = parseBody(updateExpenseSchema, request.body);

      const [existing] = await db
        .select()
        .from(expenses)
        .where(
          and(
            eq(expenses.id, request.params.expenseId),
            eq(expenses.groupId, context.group.id),
            isNull(expenses.deletedAt),
          ),
        )
        .limit(1);

      if (!existing) throw notFound('That expense does not exist.');

      // Changing money means restating the whole split, so those fields move together.
      const changesTheSplit =
        body.totalMinor !== undefined || body.payers !== undefined || body.split !== undefined;

      let lines: ReturnType<typeof resolveLines> | null = null;
      if (changesTheSplit) {
        if (body.totalMinor === undefined || !body.payers || !body.split) {
          throw badRequest(
            'To change the amount or the split, send the total, the payers and the split together.',
          );
        }
        lines = resolveLines(context, {
          totalMinor: body.totalMinor,
          payers: body.payers,
          split: body.split,
        });
      }

      await db.transaction(async (tx) => {
        await tx
          .update(expenses)
          .set({
            ...(body.description === undefined ? {} : { description: body.description.trim() }),
            ...(body.category === undefined ? {} : { category: body.category.trim() }),
            ...(body.notes === undefined ? {} : { notes: body.notes.trim() }),
            ...(body.spentAt === undefined ? {} : { spentAt: new Date(body.spentAt) }),
            ...(body.totalMinor === undefined ? {} : { totalMinor: body.totalMinor }),
            ...(body.split === undefined ? {} : { splitMode: body.split.mode }),
            updatedAt: new Date(),
          })
          .where(eq(expenses.id, existing.id));

        if (lines) {
          await tx.delete(expenseParticipants).where(eq(expenseParticipants.expenseId, existing.id));
          await tx.insert(expenseParticipants).values(
            lines.map((line) => ({
              expenseId: existing.id,
              userId: line.userId,
              paidMinor: line.paidMinor,
              owedMinor: line.owedMinor,
            })),
          );
        }
      });

      return loadExpense(db, context, existing.id);
    },
  );

  app.delete<{ Params: { groupId: string; expenseId: string } }>(
    '/groups/:groupId/expenses/:expenseId',
    async (request, reply) => {
      const me = currentUser(request);
      const context = await requireMembership(db, request.params.groupId, me.id);

      const [existing] = await db
        .select()
        .from(expenses)
        .where(
          and(
            eq(expenses.id, request.params.expenseId),
            eq(expenses.groupId, context.group.id),
            isNull(expenses.deletedAt),
          ),
        )
        .limit(1);

      if (!existing) throw notFound('That expense does not exist.');
      if (existing.createdBy !== me.id && context.role !== 'owner') {
        throw forbidden('Only whoever added this expense, or the group owner, can remove it.');
      }

      // Soft delete: the row stays, so an audit of past balances still works.
      await db
        .update(expenses)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(expenses.id, existing.id));

      reply.code(204);
      return null;
    },
  );
}

/** Validate the participants against the group, then resolve the split. */
function resolveLines(
  context: GroupContext,
  body: {
    totalMinor: number;
    payers: Array<{ userId: string; paidMinor: number }>;
    split: Parameters<typeof buildExpenseLines>[2];
  },
) {
  for (const payer of body.payers) {
    assertMemberOfGroup(context, payer.userId, 'A payer on this expense');
  }
  for (const participant of body.split.participants) {
    assertMemberOfGroup(context, participant.userId, 'A participant on this expense');
  }

  try {
    return buildExpenseLines(body.totalMinor, body.payers, body.split);
  } catch (error) {
    if (error instanceof SplitError) throw badRequest(error.message);
    throw error;
  }
}

async function loadParticipants(
  db: Awaited<ReturnType<typeof getDb>>,
  expenseIds: string[],
): Promise<Map<string, ExpenseParticipant[]>> {
  const byExpense = new Map<string, ExpenseParticipant[]>();
  if (expenseIds.length === 0) return byExpense;

  const rows = await db
    .select({
      expenseId: expenseParticipants.expenseId,
      userId: expenseParticipants.userId,
      paidMinor: expenseParticipants.paidMinor,
      owedMinor: expenseParticipants.owedMinor,
      displayName: users.displayName,
    })
    .from(expenseParticipants)
    .innerJoin(users, eq(users.id, expenseParticipants.userId))
    .where(inArray(expenseParticipants.expenseId, expenseIds));

  for (const row of rows) {
    const list = byExpense.get(row.expenseId) ?? [];
    list.push({
      userId: row.userId,
      displayName: row.displayName,
      paidMinor: row.paidMinor,
      owedMinor: row.owedMinor,
    });
    byExpense.set(row.expenseId, list);
  }

  return byExpense;
}

async function loadExpense(
  db: Awaited<ReturnType<typeof getDb>>,
  context: GroupContext,
  expenseId: string,
): Promise<Expense> {
  const [row] = await db
    .select()
    .from(expenses)
    .where(
      and(
        eq(expenses.id, expenseId),
        eq(expenses.groupId, context.group.id),
        isNull(expenses.deletedAt),
      ),
    )
    .limit(1);

  if (!row) throw notFound('That expense does not exist.');

  const participants = await loadParticipants(db, [row.id]);
  return toExpense(row, participants.get(row.id) ?? []);
}

function toExpense(
  row: typeof expenses.$inferSelect,
  participants: ExpenseParticipant[],
): Expense {
  return {
    id: row.id,
    groupId: row.groupId,
    description: row.description,
    category: row.category,
    notes: row.notes,
    totalMinor: row.totalMinor,
    currency: row.currency,
    splitMode: row.splitMode === 'exact' ? 'exact' : row.splitMode === 'percent' ? 'percent' : 'equal',
    spentAt: row.spentAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    participants,
  };
}
