/**
 * Creating groups, joining them by invite code, and the home list.
 */

import type { FastifyInstance } from 'fastify';
import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import {
  createGroupSchema,
  joinGroupSchema,
  updateGroupSchema,
  type Group,
  type GroupSummary,
} from '@zbhaga/shared';
import { getDb } from '../db/client.ts';
import { expenseParticipants, expenses, groupMembers, groups, payments } from '../db/schema.ts';
import { currentUser } from '../auth/plugin.ts';
import { badRequest, conflict, forbidden, notFound } from '../lib/errors.ts';
import { parseBody } from '../lib/validate.ts';
import { generateInviteCode, requireMembership } from '../lib/groups.ts';

const num = (value: unknown): number => Number(value ?? 0);

export default async function groupRoutes(app: FastifyInstance): Promise<void> {
  const db = await getDb();
  app.addHook('preHandler', app.requireAuth);

  /** Every group you are in, with what you are up or down in each. */
  app.get('/groups', async (request) => {
    const me = currentUser(request);

    const memberships = await db
      .select({
        id: groups.id,
        name: groups.name,
        currency: groups.currency,
        updatedAt: groups.updatedAt,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groups.id, groupMembers.groupId))
      .where(eq(groupMembers.userId, me.id))
      .orderBy(desc(groups.updatedAt));

    if (memberships.length === 0) return { items: [], nextCursor: null };
    const groupIds = memberships.map((g) => g.id);

    // Three aggregate queries beat loading the ledger for every group.
    const [counts, expenseNet, paidOut, received] = await Promise.all([
      db
        .select({ groupId: groupMembers.groupId, count: sql`count(*)` })
        .from(groupMembers)
        .where(inArray(groupMembers.groupId, groupIds))
        .groupBy(groupMembers.groupId),

      db
        .select({
          groupId: expenses.groupId,
          net: sql`coalesce(sum(${expenseParticipants.paidMinor} - ${expenseParticipants.owedMinor}), 0)`,
        })
        .from(expenseParticipants)
        .innerJoin(expenses, eq(expenses.id, expenseParticipants.expenseId))
        .where(
          and(
            eq(expenseParticipants.userId, me.id),
            isNull(expenses.deletedAt),
            inArray(expenses.groupId, groupIds),
          ),
        )
        .groupBy(expenses.groupId),

      db
        .select({ groupId: payments.groupId, total: sql`coalesce(sum(${payments.amountMinor}), 0)` })
        .from(payments)
        .where(
          and(
            eq(payments.fromUserId, me.id),
            isNull(payments.deletedAt),
            inArray(payments.groupId, groupIds),
          ),
        )
        .groupBy(payments.groupId),

      db
        .select({ groupId: payments.groupId, total: sql`coalesce(sum(${payments.amountMinor}), 0)` })
        .from(payments)
        .where(
          and(
            eq(payments.toUserId, me.id),
            isNull(payments.deletedAt),
            inArray(payments.groupId, groupIds),
          ),
        )
        .groupBy(payments.groupId),
    ]);

    const countBy = new Map(counts.map((r) => [r.groupId, num(r.count)]));
    const netBy = new Map(expenseNet.map((r) => [r.groupId, num(r.net)]));
    const paidBy = new Map(paidOut.map((r) => [r.groupId, num(r.total)]));
    const receivedBy = new Map(received.map((r) => [r.groupId, num(r.total)]));

    const items: GroupSummary[] = memberships.map((g) => ({
      id: g.id,
      name: g.name,
      currency: g.currency,
      memberCount: countBy.get(g.id) ?? 1,
      // Settling up moves you toward zero exactly like paying a bill does.
      yourNetMinor:
        (netBy.get(g.id) ?? 0) + (paidBy.get(g.id) ?? 0) - (receivedBy.get(g.id) ?? 0),
      updatedAt: g.updatedAt.toISOString(),
    }));

    return { items, nextCursor: null };
  });

  app.post('/groups', async (request, reply) => {
    const me = currentUser(request);
    const body = parseBody(createGroupSchema, request.body);

    const group = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(groups)
        .values({
          name: body.name.trim(),
          description: body.description?.trim(),
          currency: body.currency.toUpperCase(),
          inviteCode: generateInviteCode(),
          createdBy: me.id,
        })
        .returning();

      if (!created) throw badRequest('That group could not be created.');

      await tx
        .insert(groupMembers)
        .values({ groupId: created.id, userId: me.id, role: 'owner' });

      return created;
    });

    reply.code(201);
    return toGroupResponse(await requireMembership(db, group.id, me.id));
  });

  app.post('/groups/join', async (request) => {
    const me = currentUser(request);
    const body = parseBody(joinGroupSchema, request.body);
    const code = body.inviteCode.trim().toUpperCase();

    const [group] = await db.select().from(groups).where(eq(groups.inviteCode, code)).limit(1);
    if (!group) throw notFound('That invite code does not match any group.');

    await db
      .insert(groupMembers)
      .values({ groupId: group.id, userId: me.id, role: 'member' })
      .onConflictDoNothing();

    return toGroupResponse(await requireMembership(db, group.id, me.id));
  });

  app.get<{ Params: { groupId: string } }>('/groups/:groupId', async (request) => {
    const me = currentUser(request);
    return toGroupResponse(await requireMembership(db, request.params.groupId, me.id));
  });

  app.patch<{ Params: { groupId: string } }>('/groups/:groupId', async (request) => {
    const me = currentUser(request);
    const context = await requireMembership(db, request.params.groupId, me.id);
    if (context.role !== 'owner') throw forbidden('Only the group owner can change its details.');

    const body = parseBody(updateGroupSchema, request.body);
    await db
      .update(groups)
      .set({
        ...(body.name === undefined ? {} : { name: body.name.trim() }),
        ...(body.description === undefined ? {} : { description: body.description.trim() }),
        updatedAt: new Date(),
      })
      .where(eq(groups.id, context.group.id));

    return toGroupResponse(await requireMembership(db, context.group.id, me.id));
  });

  /** Rotate the invite code, for when a code has been shared too widely. */
  app.post<{ Params: { groupId: string } }>('/groups/:groupId/invite/rotate', async (request) => {
    const me = currentUser(request);
    const context = await requireMembership(db, request.params.groupId, me.id);
    if (context.role !== 'owner') throw forbidden('Only the group owner can reset the invite code.');

    const inviteCode = generateInviteCode();
    await db
      .update(groups)
      .set({ inviteCode, updatedAt: new Date() })
      .where(eq(groups.id, context.group.id));

    return { inviteCode };
  });

  /** Leaving is only allowed once you are square with everyone. */
  app.post<{ Params: { groupId: string } }>('/groups/:groupId/leave', async (request, reply) => {
    const me = currentUser(request);
    const context = await requireMembership(db, request.params.groupId, me.id);

    const [net] = await db
      .select({
        value: sql`coalesce(sum(${expenseParticipants.paidMinor} - ${expenseParticipants.owedMinor}), 0)`,
      })
      .from(expenseParticipants)
      .innerJoin(expenses, eq(expenses.id, expenseParticipants.expenseId))
      .where(
        and(
          eq(expenseParticipants.userId, me.id),
          eq(expenses.groupId, context.group.id),
          isNull(expenses.deletedAt),
        ),
      );

    const [out] = await db
      .select({ value: sql`coalesce(sum(${payments.amountMinor}), 0)` })
      .from(payments)
      .where(
        and(
          eq(payments.fromUserId, me.id),
          eq(payments.groupId, context.group.id),
          isNull(payments.deletedAt),
        ),
      );

    const [inbound] = await db
      .select({ value: sql`coalesce(sum(${payments.amountMinor}), 0)` })
      .from(payments)
      .where(
        and(
          eq(payments.toUserId, me.id),
          eq(payments.groupId, context.group.id),
          isNull(payments.deletedAt),
        ),
      );

    const balance = num(net?.value) + num(out?.value) - num(inbound?.value);
    if (balance !== 0) {
      throw conflict('Settle up before you leave: your balance in this group is not zero.', {
        netMinor: balance,
      });
    }

    if (context.role === 'owner' && context.members.length > 1) {
      throw conflict('Hand the group over to another member before you leave.');
    }

    await db
      .delete(groupMembers)
      .where(
        and(eq(groupMembers.groupId, context.group.id), eq(groupMembers.userId, me.id)),
      );

    reply.code(204);
    return null;
  });
}

function toGroupResponse(context: Awaited<ReturnType<typeof requireMembership>>): Group {
  return {
    id: context.group.id,
    name: context.group.name,
    description: context.group.description,
    currency: context.group.currency,
    inviteCode: context.group.inviteCode,
    createdAt: context.group.createdAt.toISOString(),
    members: context.members,
  };
}
