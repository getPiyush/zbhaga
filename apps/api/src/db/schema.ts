/**
 * The zBhaga schema.
 *
 * Two decisions shape everything else here:
 *
 *  1. Money is a bigint count of minor units. No floats, ever.
 *  2. An expense stores one row per person with BOTH what they put in
 *     (`paidMinor`) and what they consumed (`owedMinor`). A single payer is
 *     just the case where one row carries the whole total. This makes every
 *     balance a plain SUM, and it means the ledger never has to re-derive a
 *     split that was already agreed.
 */

import {
  bigint,
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 254 }).notNull(),
    /** Null for accounts that only ever sign in with Google or Microsoft. */
    passwordHash: text('password_hash'),
    displayName: varchar('display_name', { length: 80 }).notNull(),
    avatarUrl: text('avatar_url'),
    emailVerified: boolean('email_verified').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('users_email_key').on(t.email)],
);

/** A linked Google / Microsoft account. One user can have several. */
export const identities = pgTable(
  'identities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 20 }).notNull(),
    providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('identities_provider_account_key').on(t.provider, t.providerAccountId),
    index('identities_user_idx').on(t.userId),
  ],
);

/**
 * Refresh tokens are stored hashed, so a database leak does not hand out
 * sessions. Rotating one revokes the row it replaced.
 */
export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('refresh_tokens_hash_key').on(t.tokenHash),
    index('refresh_tokens_user_idx').on(t.userId),
  ],
);

export const groups = pgTable(
  'groups',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 80 }).notNull(),
    description: varchar('description', { length: 400 }),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    /** Short human-typeable code, the thing you paste into a chat. */
    inviteCode: varchar('invite_code', { length: 16 }).notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('groups_invite_code_key').on(t.inviteCode)],
);

export const groupMembers = pgTable(
  'group_members',
  {
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 10 }).notNull().default('member'),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.groupId, t.userId] }),
    // "Which groups am I in?" is the query behind every screen in the app.
    index('group_members_user_idx').on(t.userId),
  ],
);

export const expenses = pgTable(
  'expenses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    description: varchar('description', { length: 200 }).notNull(),
    category: varchar('category', { length: 40 }),
    notes: varchar('notes', { length: 1000 }),
    totalMinor: bigint('total_minor', { mode: 'number' }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    splitMode: varchar('split_mode', { length: 10 }).notNull(),
    spentAt: timestamp('spent_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    /** Soft delete: a removed expense must not silently rewrite past balances. */
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    // The group timeline, newest first - the single hottest read in the app.
    index('expenses_group_spent_idx').on(t.groupId, t.spentAt),
    index('expenses_group_created_idx').on(t.groupId, t.createdAt),
  ],
);

export const expenseParticipants = pgTable(
  'expense_participants',
  {
    expenseId: uuid('expense_id')
      .notNull()
      .references(() => expenses.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** What this person actually put down. Zero for a non-payer. */
    paidMinor: bigint('paid_minor', { mode: 'number' }).notNull().default(0),
    /** This person's share of the bill. Zero if they were not in on it. */
    owedMinor: bigint('owed_minor', { mode: 'number' }).notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.expenseId, t.userId] }),
    index('expense_participants_user_idx').on(t.userId),
  ],
);

/** A real payment from one member to another, squaring up. */
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    fromUserId: uuid('from_user_id')
      .notNull()
      .references(() => users.id),
    toUserId: uuid('to_user_id')
      .notNull()
      .references(() => users.id),
    amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    method: varchar('method', { length: 10 }).notNull().default('other'),
    note: varchar('note', { length: 200 }),
    paidAt: timestamp('paid_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    index('payments_group_paid_idx').on(t.groupId, t.paidAt),
    index('payments_from_idx').on(t.fromUserId),
    index('payments_to_idx').on(t.toUserId),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type GroupRow = typeof groups.$inferSelect;
export type ExpenseRow = typeof expenses.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;
export type ExpenseParticipantRow = typeof expenseParticipants.$inferSelect;
