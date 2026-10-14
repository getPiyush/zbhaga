/**
 * Schema bootstrap.
 *
 * This is deliberately a hand-written, idempotent DDL script rather than a
 * generated migration chain: it lets a fresh clone (or a test run) reach a
 * working database in one step with no extra tooling. Once the app is carrying
 * real data, switch to versioned migrations with `drizzle-kit generate` and run
 * those instead - see the README.
 */

import { sql } from 'drizzle-orm';
import type { Db } from './client.ts';

const STATEMENTS: string[] = [
  // `gen_random_uuid()` is core Postgres from 13 onward, so no extension is
  // needed here - which also keeps this script runnable on PGlite.
  `CREATE TABLE IF NOT EXISTS users (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     email varchar(254) NOT NULL,
     password_hash text,
     display_name varchar(80) NOT NULL,
     avatar_url text,
     email_verified boolean NOT NULL DEFAULT false,
     created_at timestamptz NOT NULL DEFAULT now(),
     updated_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (email)`,

  `CREATE TABLE IF NOT EXISTS identities (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     provider varchar(20) NOT NULL,
     provider_account_id varchar(255) NOT NULL,
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS identities_provider_account_key
     ON identities (provider, provider_account_id)`,
  `CREATE INDEX IF NOT EXISTS identities_user_idx ON identities (user_id)`,

  `CREATE TABLE IF NOT EXISTS refresh_tokens (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     token_hash varchar(64) NOT NULL,
     expires_at timestamptz NOT NULL,
     revoked_at timestamptz,
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS refresh_tokens_hash_key ON refresh_tokens (token_hash)`,
  `CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx ON refresh_tokens (user_id)`,

  `CREATE TABLE IF NOT EXISTS groups (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name varchar(80) NOT NULL,
     description varchar(400),
     currency varchar(3) NOT NULL DEFAULT 'INR',
     invite_code varchar(16) NOT NULL,
     created_by uuid NOT NULL REFERENCES users(id),
     created_at timestamptz NOT NULL DEFAULT now(),
     updated_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS groups_invite_code_key ON groups (invite_code)`,

  `CREATE TABLE IF NOT EXISTS group_members (
     group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
     user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     role varchar(10) NOT NULL DEFAULT 'member',
     joined_at timestamptz NOT NULL DEFAULT now(),
     PRIMARY KEY (group_id, user_id)
   )`,
  `CREATE INDEX IF NOT EXISTS group_members_user_idx ON group_members (user_id)`,

  `CREATE TABLE IF NOT EXISTS expenses (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
     description varchar(200) NOT NULL,
     category varchar(40),
     notes varchar(1000),
     total_minor bigint NOT NULL,
     currency varchar(3) NOT NULL,
     split_mode varchar(10) NOT NULL,
     spent_at timestamptz NOT NULL DEFAULT now(),
     created_by uuid NOT NULL REFERENCES users(id),
     created_at timestamptz NOT NULL DEFAULT now(),
     updated_at timestamptz NOT NULL DEFAULT now(),
     deleted_at timestamptz,
     CONSTRAINT expenses_total_positive CHECK (total_minor > 0)
   )`,
  `CREATE INDEX IF NOT EXISTS expenses_group_spent_idx ON expenses (group_id, spent_at DESC)`,
  `CREATE INDEX IF NOT EXISTS expenses_group_created_idx ON expenses (group_id, created_at DESC)`,

  `CREATE TABLE IF NOT EXISTS expense_participants (
     expense_id uuid NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
     user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     paid_minor bigint NOT NULL DEFAULT 0,
     owed_minor bigint NOT NULL DEFAULT 0,
     PRIMARY KEY (expense_id, user_id),
     CONSTRAINT expense_participants_non_negative
       CHECK (paid_minor >= 0 AND owed_minor >= 0)
   )`,
  `CREATE INDEX IF NOT EXISTS expense_participants_user_idx ON expense_participants (user_id)`,

  `CREATE TABLE IF NOT EXISTS payments (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
     from_user_id uuid NOT NULL REFERENCES users(id),
     to_user_id uuid NOT NULL REFERENCES users(id),
     amount_minor bigint NOT NULL,
     currency varchar(3) NOT NULL,
     method varchar(10) NOT NULL DEFAULT 'other',
     note varchar(200),
     paid_at timestamptz NOT NULL DEFAULT now(),
     created_by uuid NOT NULL REFERENCES users(id),
     created_at timestamptz NOT NULL DEFAULT now(),
     deleted_at timestamptz,
     CONSTRAINT payments_amount_positive CHECK (amount_minor > 0),
     CONSTRAINT payments_distinct_parties CHECK (from_user_id <> to_user_id)
   )`,
  `CREATE INDEX IF NOT EXISTS payments_group_paid_idx ON payments (group_id, paid_at DESC)`,
  `CREATE INDEX IF NOT EXISTS payments_from_idx ON payments (from_user_id)`,
  `CREATE INDEX IF NOT EXISTS payments_to_idx ON payments (to_user_id)`,
];

export async function applySchema(db: Db): Promise<void> {
  for (const statement of STATEMENTS) {
    await db.execute(sql.raw(statement));
  }
}
