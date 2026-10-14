/**
 * One database handle for the process.
 *
 * `postgres://...` uses the real driver and a connection pool. Anything else
 * starts PGlite, an embedded Postgres that runs in-process, so a fresh clone
 * boots with no database to install. Both speak the same dialect, so queries
 * written against one behave identically on the other.
 */

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { env } from '../env.ts';
import * as schema from './schema.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Both drivers extend the same Postgres base class. Typing the handle as that
 * base (rather than as a union of the two) keeps every query builder call
 * resolvable, and keeps driver choice invisible to the rest of the app.
 */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export const usingPglite = !/^postgres(ql)?:\/\//.test(env.DATABASE_URL);

let dbPromise: Promise<Db> | null = null;
let closeFn: () => Promise<void> = async () => {};

async function connect(): Promise<Db> {
  if (usingPglite) {
    // PGlite is a dev dependency; importing it lazily keeps it out of the
    // production dependency graph entirely.
    const { PGlite } = await import('@electric-sql/pglite');
    let dataDir = env.DATABASE_URL.replace(/^pglite:\/\//, '') || 'memory://';
    // Resolve relative paths from the project root (../../ from src/db/)
    if (dataDir !== 'memory://' && !dataDir.startsWith('/')) {
      dataDir = resolve(__dirname, '../../..', dataDir);
    }
    const client = new PGlite(dataDir);
    await client.waitReady;
    closeFn = () => client.close();
    return drizzlePglite(client, { schema }) as unknown as Db;
  }

  const { Pool } = await import('pg');
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  // Fail fast on a bad URL instead of on the first request.
  const probe = await pool.connect();
  probe.release();
  closeFn = () => pool.end();
  return drizzlePg(pool, { schema }) as unknown as Db;
}

export function getDb(): Promise<Db> {
  dbPromise ??= connect();
  return dbPromise;
}

export async function closeDb(): Promise<void> {
  if (!dbPromise) return;
  await dbPromise;
  await closeFn();
  dbPromise = null;
}

export { schema };
