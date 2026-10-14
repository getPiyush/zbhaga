/**
 * The "what do I actually owe?" endpoint.
 *
 * It answers in three shapes at once, because the screen needs all three:
 * a net figure per member, the real person-to-person debts behind those
 * numbers, and the shortest set of payments that would clear the group.
 */

import type { FastifyInstance } from 'fastify';
import {
  netBalances,
  pairwiseDebts,
  positionFor,
  simplifyDebts,
  type GroupBalances,
  type Transfer,
  type TransferView,
} from '@zbhaga/shared';
import { getDb } from '../db/client.ts';
import { currentUser } from '../auth/plugin.ts';
import { loadLedger, requireMembership, type GroupContext } from '../lib/groups.ts';

export default async function balanceRoutes(app: FastifyInstance): Promise<void> {
  const db = await getDb();
  app.addHook('preHandler', app.requireAuth);

  app.get<{ Params: { groupId: string } }>('/groups/:groupId/balances', async (request) => {
    const me = currentUser(request);
    const context = await requireMembership(db, request.params.groupId, me.id);
    const ledger = await loadLedger(db, context.group.id);

    const net = netBalances(ledger.expenses, ledger.settlements);
    const debts = pairwiseDebts(ledger.expenses, ledger.settlements);
    const suggested = simplifyDebts(net);
    const you = positionFor(me.id, ledger.expenses, ledger.settlements);

    const response: GroupBalances = {
      groupId: context.group.id,
      currency: context.group.currency,
      // Every member appears, including the ones sitting at exactly zero.
      balances: context.members.map((member) => ({
        userId: member.userId,
        displayName: member.displayName,
        avatarUrl: member.avatarUrl,
        netMinor: net.get(member.userId) ?? 0,
      })),
      debts: debts.map((t) => withNames(t, context)),
      suggested: suggested.map((t) => withNames(t, context)),
      you: {
        userId: me.id,
        netMinor: you.netMinor,
        totalOwesMinor: you.totalOwesMinor,
        totalOwedByMinor: you.totalOwedByMinor,
        owes: you.owes.map((t) => withNames(t, context)),
        owedBy: you.owedBy.map((t) => withNames(t, context)),
      },
    };

    return response;
  });
}

function withNames(transfer: Transfer, context: GroupContext): TransferView {
  return {
    fromUserId: transfer.fromUserId,
    fromDisplayName: context.nameOf(transfer.fromUserId),
    toUserId: transfer.toUserId,
    toDisplayName: context.nameOf(transfer.toUserId),
    amountMinor: transfer.amountMinor,
  };
}
