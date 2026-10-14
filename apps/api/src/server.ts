/** Boots the API and shuts it down cleanly. */

import { buildApp } from './app.ts';
import { env, isProduction } from './env.ts';
import { closeDb, getDb, usingPglite } from './db/client.ts';
import { applySchema } from './db/migrate.ts';

const db = await getDb();

// In development the embedded database starts empty, so bring the schema up
// automatically. In production migrations are a deliberate, separate step.
if (!isProduction) {
  await applySchema(db);
}

const app = await buildApp();

try {
  await app.listen({ port: env.PORT, host: env.HOST });
  app.log.info(
    `zBhaga API ready on ${env.PUBLIC_API_URL} (${usingPglite ? 'embedded PGlite' : 'PostgreSQL'})`,
  );
} catch (error) {
  app.log.error({ err: error }, 'The API failed to start');
  process.exit(1);
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, async () => {
    app.log.info(`${signal} received, shutting down`);
    await app.close();
    await closeDb();
    process.exit(0);
  });
}
