/**
 * Shared group lookups. Every group-scoped route starts by proving the caller
 * is a member, so that check lives in exactly one place.
 */

import { randomInt } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import type { Db } from '../db/client.ts';
import { expenseParticipants, expenses, groupMembers, groups, payments, users } from '../db/schema.ts';
import { forbidden, notFound } from './errors.ts';
import type { GroupMember, GroupRole } from '@zbhaga/shared';

/** No 0/O or 1/I/L, because people read these codes out loud. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateInviteCode(length = 8): string {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

export interface GroupContext {
  group: typeof groups.$inferSelect;
  members: GroupMember[];
  role: GroupRole;
  /** Display names by user id, for turning ledger rows into something readable. */
  nameOf: (userId: string) => string;
}

export async function requireMembership(
  db: Db,
  groupId: string,
  userId: string,
): Promise<GroupContext> {
  const [group] = await db.select().from(groups).where(eq(groups.id, groupId)).limit(1);
  if (!group) throw notFound('That group does not exist.');

  const rows = await db
    .select({
      userId: groupMembers.userId,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt,
      displayName: users.displayName,
      email: users.email,
      avatarUrl: users.avatarUrl,
    })
    .from(groupMembers)
    .innerJoin(users, eq(users.id, groupMembers.userId))
    .where(eq(groupMembers.groupId, groupId));

  const members: GroupMember[] = rows.map((r) => ({
    userId: r.userId,
    displayName: r.displayName,
    email: r.email,
    avatarUrl: r.avatarUrl,
    role: r.role === 'owner' ? 'owner' : 'member',
    joinedAt: r.joinedAt.toISOString(),
  }));

  const me = members.find((m) => m.userId === userId);
  if (!me) throw forbidden('You are not a member of this group.');

  const names = new Map(members.map((m) => [m.userId, m.displayName]));

  return {
    group,
    members,
    role: me.role,
    nameOf: (id) => names.get(id) ?? 'Former member',
  };
}

export function assertMemberOfGroup(context: GroupContext, userId: string, label: string): void {
  if (!context.members.some((m) => m.userId === userId)) {
    throw forbidden(`${label} is not a member of this group.`);
  }
}

export interface LedgerData {
  expenses: Array<{ lines: Array<{ userId: string; paidMinor: number; owedMinor: number }> }>;
  settlements: Array<{ fromUserId: string; toUserId: string; amountMinor: number }>;
}

/**
 * Every live expense line and payment in a group, shaped for the ledger
 * functions in `@zbhaga/shared`.
 *
 * This reads the group's whole history. That is the right trade at the size a
 * shared-expenses group actually reaches, and the indexes keep it cheap; see
 * the README for the rollup table to add if a group ever outgrows it.
 */
export async function loadLedger(db: Db, groupId: string): Promise<LedgerData> {
  const lines = await db
    .select({
      expenseId: expenseParticipants.expenseId,
      userId: expenseParticipants.userId,
      paidMinor: expenseParticipants.paidMinor,
      owedMinor: expenseParticipants.owedMinor,
    })
    .from(expenseParticipants)
    .innerJoin(expenses, eq(expenses.id, expenseParticipants.expenseId))
    .where(and(eq(expenses.groupId, groupId), isNull(expenses.deletedAt)));

  const grouped = new Map<string, LedgerData['expenses'][number]>();
  for (const line of lines) {
    let entry = grouped.get(line.expenseId);
    if (!entry) {
      entry = { lines: [] };
      grouped.set(line.expenseId, entry);
    }
    entry.lines.push({
      userId: line.userId,
      paidMinor: line.paidMinor,
      owedMinor: line.owedMinor,
    });
  }

  const settlementRows = await db
    .select({
      fromUserId: payments.fromUserId,
      toUserId: payments.toUserId,
      amountMinor: payments.amountMinor,
    })
    .from(payments)
    .where(and(eq(payments.groupId, groupId), isNull(payments.deletedAt)));

  return { expenses: [...grouped.values()], settlements: settlementRows };
}
