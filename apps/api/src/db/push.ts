/** `npm run db:push` - bring the configured database up to the current schema. */

import { getDb, closeDb, usingPglite } from './client.ts';
import { applySchema } from './migrate.ts';
import { env } from '../env.ts';

const db = await getDb();
await applySchema(db);
await closeDb();

const target = usingPglite ? `PGlite at ${env.DATABASE_URL}` : 'PostgreSQL';
console.log(`zBhaga schema is up to date (${target}).`);
