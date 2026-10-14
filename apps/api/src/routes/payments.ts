/**
 * "I paid Priya back." Recording a settlement between two members.
 */

import type { FastifyInstance } from 'fastify';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { recordPaymentSchema, type Payment } from '@zbhaga/shared';
import { getDb } from '../db/client.ts';
import { groups, payments } from '../db/schema.ts';
import { currentUser } from '../auth/plugin.ts';
import { badRequest, forbidden, notFound } from '../lib/errors.ts';
import { parseBody } from '../lib/validate.ts';
import { assertMemberOfGroup, requireMembership } from '../lib/groups.ts';

export default async function paymentRoutes(app: FastifyInstance): Promise<void> {
  const db = await getDb();
  app.addHook('preHandler', app.requireAuth);

  app.post<{ Params: { groupId: string } }>(
    '/groups/:groupId/payments',
    async (request, reply) => {
      const me = currentUser(request);
      const context = await requireMembership(db, request.params.groupId, me.id);
      const body = parseBody(recordPaymentSchema, request.body);

      const fromUserId = body.fromUserId ?? me.id;
      if (fromUserId === body.toUserId) {
        throw badRequest('A payment needs two different people.');
      }

      assertMemberOfGroup(context, fromUserId, 'The person paying');
      assertMemberOfGroup(context, body.toUserId, 'The person being paid');

      // Recording a payment on someone else's behalf is only sensible when you
      // are one half of it, or you run the group.
      const involved = fromUserId === me.id || body.toUserId === me.id;
      if (!involved && context.role !== 'owner') {
        throw forbidden('You can only record payments you are part of.');
      }

      const [row] = await db
        .insert(payments)
        .values({
          groupId: context.group.id,
          fromUserId,
          toUserId: body.toUserId,
          amountMinor: body.amountMinor,
          currency: context.group.currency,
          method: body.method,
          note: body.note?.trim(),
          paidAt: body.paidAt ? new Date(body.paidAt) : new Date(),
          createdBy: me.id,
        })
        .returning();

      if (!row) throw badRequest('That payment could not be saved.');

      await db.update(groups).set({ updatedAt: new Date() }).where(eq(groups.id, context.group.id));

      reply.code(201);
      return toPayment(row);
    },
  );

  app.get<{ Params: { groupId: string }; Querystring: { limit?: string } }>(
    '/groups/:groupId/payments',
    async (request) => {
      const me = currentUser(request);
      const context = await requireMembership(db, request.params.groupId, me.id);
      const limit = Math.min(Math.max(Number(request.query.limit ?? 50) || 50, 1), 200);

      const rows = await db
        .select()
        .from(payments)
        .where(and(eq(payments.groupId, context.group.id), isNull(payments.deletedAt)))
        .orderBy(desc(payments.paidAt), desc(payments.id))
        .limit(limit);

      return { items: rows.map(toPayment), nextCursor: null };
    },
  );

  app.delete<{ Params: { groupId: string; paymentId: string } }>(
    '/groups/:groupId/payments/:paymentId',
    async (request, reply) => {
      const me = currentUser(request);
      const context = await requireMembership(db, request.params.groupId, me.id);

      const [existing] = await db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.id, request.params.paymentId),
            eq(payments.groupId, context.group.id),
            isNull(payments.deletedAt),
          ),
        )
        .limit(1);

      if (!existing) throw notFound('That payment does not exist.');

      const involved = existing.fromUserId === me.id || existing.toUserId === me.id;
      if (!involved && context.role !== 'owner') {
        throw forbidden('You can only remove payments you are part of.');
      }

      await db.update(payments).set({ deletedAt: new Date() }).where(eq(payments.id, existing.id));

      reply.code(204);
      return null;
    },
  );
}

function toPayment(row: typeof payments.$inferSelect): Payment {
  return {
    id: row.id,
    groupId: row.groupId,
    fromUserId: row.fromUserId,
    toUserId: row.toUserId,
    amountMinor: row.amountMinor,
    currency: row.currency,
    method: row.method,
    note: row.note,
    paidAt: row.paidAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}
