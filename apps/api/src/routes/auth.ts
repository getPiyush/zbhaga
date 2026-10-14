/**
 * Sign-up, sign-in, token refresh, and the Google / Microsoft round trip.
 */

import type { FastifyInstance } from 'fastify';
import { and, eq } from 'drizzle-orm';
import {
  refreshSchema,
  signInSchema,
  signUpSchema,
  type AuthResult,
  type PublicUser,
} from '@zbhaga/shared';
import { getDb } from '../db/client.ts';
import { identities, users } from '../db/schema.ts';
import { dummyVerify, hashPassword, verifyPassword } from '../auth/password.ts';
import {
  issueRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken,
} from '../auth/tokens.ts';
import {
  enabledProviders,
  exchangeCode,
  isProviderEnabled,
  startAuthorization,
  verifyState,
  type ProviderName,
} from '../auth/oauth.ts';
import { badRequest, conflict, notFound, unauthorized } from '../lib/errors.ts';
import { parseBody } from '../lib/validate.ts';
import { currentUser } from '../auth/plugin.ts';
import { env } from '../env.ts';

const toPublicUser = (row: typeof users.$inferSelect): PublicUser => ({
  id: row.id,
  email: row.email,
  displayName: row.displayName,
  avatarUrl: row.avatarUrl,
});

async function buildSession(
  db: Awaited<ReturnType<typeof getDb>>,
  row: typeof users.$inferSelect,
): Promise<AuthResult> {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ sub: row.id, email: row.email, name: row.displayName }),
    issueRefreshToken(db, row.id),
  ]);
  return {
    user: toPublicUser(row),
    accessToken,
    refreshToken,
    expiresInSeconds: env.ACCESS_TOKEN_TTL_SECONDS,
  };
}

/**
 * Only the app's own origins are acceptable landing spots after an OAuth
 * round trip, so a crafted `returnTo` cannot be used to forward a fresh
 * session somewhere else.
 */
function safeReturnTo(candidate: string | undefined): string {
  const fallback = env.PUBLIC_APP_URL;
  if (!candidate) return fallback;
  // Native builds come back to a custom scheme rather than an https origin.
  if (candidate.startsWith('zbhaga://') || candidate.startsWith('exp://')) return candidate;
  try {
    const url = new URL(candidate);
    const allowed = new Set(
      [env.PUBLIC_APP_URL, env.PUBLIC_API_URL, ...env.CORS_ORIGINS.split(',')]
        .map((o) => o.trim())
        .filter(Boolean)
        .map((o) => new URL(o).origin),
    );
    return allowed.has(url.origin) ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

export default async function authRoutes(app: FastifyInstance): Promise<void> {
  const db = await getDb();

  app.get('/auth/providers', async () => ({
    password: true,
    oauth: enabledProviders(),
  }));

  app.post('/auth/signup', async (request, reply) => {
    const body = parseBody(signUpSchema, request.body);
    const email = body.email.trim().toLowerCase();

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      throw conflict('There is already an account with that email address.');
    }

    const passwordHash = await hashPassword(body.password);
    const [created] = await db
      .insert(users)
      .values({ email, passwordHash, displayName: body.displayName.trim() })
      .returning();

    if (!created) throw badRequest('That account could not be created.');
    reply.code(201);
    return buildSession(db, created);
  });

  app.post('/auth/signin', async (request) => {
    const body = parseBody(signInSchema, request.body);
    const email = body.email.trim().toLowerCase();

    const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!row?.passwordHash) {
      // Spend the same time whether or not the account exists.
      await dummyVerify();
      throw unauthorized('That email and password do not match an account.');
    }

    const ok = await verifyPassword(body.password, row.passwordHash);
    if (!ok) throw unauthorized('That email and password do not match an account.');

    return buildSession(db, row);
  });

  app.post('/auth/refresh', async (request) => {
    const body = parseBody(refreshSchema, request.body);
    const rotated = await rotateRefreshToken(db, body.refreshToken);
    if (!rotated) throw unauthorized('That session is no longer valid. Please sign in again.');

    const [row] = await db.select().from(users).where(eq(users.id, rotated.userId)).limit(1);
    if (!row) throw unauthorized('That session is no longer valid. Please sign in again.');

    const accessToken = await signAccessToken({
      sub: row.id,
      email: row.email,
      name: row.displayName,
    });

    return {
      user: toPublicUser(row),
      accessToken,
      refreshToken: rotated.refreshToken,
      expiresInSeconds: env.ACCESS_TOKEN_TTL_SECONDS,
    } satisfies AuthResult;
  });

  app.post('/auth/signout', async (request, reply) => {
    const body = parseBody(refreshSchema, request.body);
    await revokeRefreshToken(db, body.refreshToken);
    reply.code(204);
    return null;
  });

  app.get('/auth/me', { preHandler: [app.requireAuth] }, async (request) => {
    const me = currentUser(request);
    const [row] = await db.select().from(users).where(eq(users.id, me.id)).limit(1);
    if (!row) throw notFound('That account no longer exists.');
    return toPublicUser(row);
  });

  /* ------------------------------------------------------------- oauth -- */

  app.get<{ Params: { provider: string }; Querystring: { returnTo?: string } }>(
    '/auth/oauth/:provider/start',
    async (request, reply) => {
      const provider = request.params.provider as ProviderName;
      if (provider !== 'google' && provider !== 'microsoft') {
        throw notFound('Unknown sign-in provider.');
      }
      if (!isProviderEnabled(provider)) {
        throw badRequest(`${provider} sign-in is not configured on this server.`);
      }

      const { authorizeUrl } = await startAuthorization(
        provider,
        safeReturnTo(request.query.returnTo),
      );

      // A browser follows the redirect; a native client reads the JSON instead.
      if (request.headers.accept?.includes('application/json')) {
        return { authorizeUrl };
      }
      return reply.redirect(authorizeUrl, 302);
    },
  );

  app.get<{
    Params: { provider: string };
    Querystring: { code?: string; state?: string; error?: string; error_description?: string };
  }>('/auth/oauth/:provider/callback', async (request, reply) => {
    const { code, state, error, error_description: errorDescription } = request.query;

    if (error) {
      throw badRequest(`Sign-in was not completed: ${errorDescription ?? error}`);
    }
    if (!code || !state) throw badRequest('That sign-in link is incomplete.');

    let verified;
    try {
      verified = await verifyState(state);
    } catch {
      throw badRequest('That sign-in attempt has expired. Please try again.');
    }

    const profile = await exchangeCode(verified.provider, code, verified.codeVerifier);
    const row = await linkOrCreateUser(db, verified.provider, profile);
    const session = await buildSession(db, row);

    // Hand the tokens back in the URL fragment: fragments are not sent to the
    // server and do not land in server logs or the Referer header.
    const target = new URL(safeReturnTo(verified.returnTo));
    target.hash = new URLSearchParams({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresIn: String(session.expiresInSeconds),
    }).toString();

    return reply.redirect(target.toString(), 302);
  });
}

/**
 * Match the provider account to an existing user, falling back to matching on
 * a verified email address so that signing in with Google after having signed
 * up with a password lands on the same account rather than a duplicate.
 */
async function linkOrCreateUser(
  db: Awaited<ReturnType<typeof getDb>>,
  provider: ProviderName,
  profile: {
    providerAccountId: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    emailVerified: boolean;
  },
): Promise<typeof users.$inferSelect> {
  const [identity] = await db
    .select()
    .from(identities)
    .where(
      and(
        eq(identities.provider, provider),
        eq(identities.providerAccountId, profile.providerAccountId),
      ),
    )
    .limit(1);

  if (identity) {
    const [row] = await db.select().from(users).where(eq(users.id, identity.userId)).limit(1);
    if (row) return row;
  }

  const [byEmail] = await db.select().from(users).where(eq(users.email, profile.email)).limit(1);

  if (byEmail) {
    if (!profile.emailVerified) {
      throw conflict(
        'An account already uses that email address. Sign in with your password first, then link this provider.',
      );
    }
    await db
      .insert(identities)
      .values({
        userId: byEmail.id,
        provider,
        providerAccountId: profile.providerAccountId,
      })
      .onConflictDoNothing();
    return byEmail;
  }

  const [created] = await db
    .insert(users)
    .values({
      email: profile.email,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      emailVerified: profile.emailVerified,
    })
    .returning();

  if (!created) throw badRequest('That account could not be created.');

  await db.insert(identities).values({
    userId: created.id,
    provider,
    providerAccountId: profile.providerAccountId,
  });

  return created;
}
