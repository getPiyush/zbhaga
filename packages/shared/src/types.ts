/**
 * The contract between the app and the API. Both sides import these schemas,
 * so a change to a request shape breaks the client at compile time rather than
 * at runtime in someone's hands.
 */

import { z } from 'zod';
import { PERCENT_SCALE } from './split.ts';

export const uuid = z.uuid();
const minorAmount = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);

/* ------------------------------------------------------------------ auth -- */

export const signUpSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(10).max(200),
  displayName: z.string().min(1).max(80),
});

export const signInSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(200),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export type SignUpBody = z.infer<typeof signUpSchema>;
export type SignInBody = z.infer<typeof signInSchema>;

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

/* ---------------------------------------------------------------- groups -- */

export const createGroupSchema = z.object({
  name: z.string().min(1).max(80),
  currency: z.literal('USD').default('USD'),
  description: z.string().max(400).optional(),
});

export const joinGroupSchema = z.object({
  inviteCode: z.string().min(6).max(16),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(400).optional(),
});

export type GroupRole = 'owner' | 'member';

export interface GroupMember {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  role: GroupRole;
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  inviteCode: string;
  createdAt: string;
  members: GroupMember[];
}

export interface GroupSummary {
  id: string;
  name: string;
  currency: string;
  memberCount: number;
  /** This member's net position: positive means the group owes them. */
  yourNetMinor: number;
  updatedAt: string;
}

/* -------------------------------------------------------------- expenses -- */

export const splitSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('equal'),
    participants: z.array(z.object({ userId: uuid })).min(1),
  }),
  z.object({
    mode: z.literal('exact'),
    participants: z
      .array(z.object({ userId: uuid, amountMinor: z.number().int().nonnegative() }))
      .min(1),
  }),
  z.object({
    mode: z.literal('percent'),
    participants: z
      .array(z.object({ userId: uuid, percentBp: z.number().int().nonnegative().max(PERCENT_SCALE) }))
      .min(1),
  }),
]);

export const createExpenseSchema = z.object({
  description: z.string().min(1).max(200),
  totalMinor: minorAmount,
  category: z.string().max(40).optional(),
  spentAt: z.iso.datetime().optional(),
  notes: z.string().max(1000).optional(),
  payers: z.array(z.object({ userId: uuid, paidMinor: minorAmount })).min(1),
  split: splitSchema,
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseBody = z.infer<typeof createExpenseSchema>;

export interface ExpenseParticipant {
  userId: string;
  displayName: string;
  paidMinor: number;
  owedMinor: number;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  category: string | null;
  notes: string | null;
  totalMinor: number;
  currency: string;
  splitMode: 'equal' | 'exact' | 'percent';
  spentAt: string;
  createdAt: string;
  createdBy: string;
  participants: ExpenseParticipant[];
}

/* -------------------------------------------------------------- payments -- */

export const recordPaymentSchema = z.object({
  /** Who handed over the money. Defaults to the caller. */
  fromUserId: uuid.optional(),
  toUserId: uuid,
  amountMinor: minorAmount,
  paidAt: z.iso.datetime().optional(),
  method: z.enum(['cash', 'upi', 'bank', 'card', 'other']).default('other'),
  note: z.string().max(200).optional(),
});

export type RecordPaymentBody = z.infer<typeof recordPaymentSchema>;

export interface Payment {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amountMinor: number;
  currency: string;
  method: string;
  note: string | null;
  paidAt: string;
  createdAt: string;
}

/* -------------------------------------------------------------- balances -- */

export interface BalanceEntry {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  netMinor: number;
}

export interface TransferView {
  fromUserId: string;
  fromDisplayName: string;
  toUserId: string;
  toDisplayName: string;
  amountMinor: number;
}

export interface GroupBalances {
  groupId: string;
  currency: string;
  balances: BalanceEntry[];
  /** Debts between the people who actually shared each expense. */
  debts: TransferView[];
  /** The fewest payments that would clear the whole group. */
  suggested: TransferView[];
  you: {
    userId: string;
    netMinor: number;
    totalOwesMinor: number;
    totalOwedByMinor: number;
    owes: TransferView[];
    owedBy: TransferView[];
  };
}

/* ----------------------------------------------------------------- pages -- */

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}
