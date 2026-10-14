/**
 * Sessions: a short-lived signed access token the client sends on every
 * request, plus a long-lived refresh token that lives as a row in the database
 * so it can actually be revoked.
 *
 * Only the SHA-256 of a refresh token is stored. Someone who walks off with a
 * database dump gets no usable sessions out of it.
 */

import { createHash, randomBytes } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { and, eq, isNull, lt, or } from 'drizzle-orm';
import { env } from '../env.ts';
import type { Db } from '../db/client.ts';
import { refreshTokens } from '../db/schema.ts';

const secret = new TextEncoder().encode(env.JWT_SECRET);
const ISSUER = 'zbhaga';

export interface AccessTokenClaims {
  sub: string;
  email: string;
  name: string;
}

export async function signAccessToken(claims: AccessTokenClaims): Promise<string> {
  return new SignJWT({ email: claims.email, name: claims.name })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(claims.sub)
    .setIssuer(ISSUER)
    .setAudience(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${env.ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenClaims> {
  const { payload } = await jwtVerify(token, secret, {
    issuer: ISSUER,
    audience: ISSUER,
    algorithms: ['HS256'],
  });
  if (!payload.sub) throw new Error('Token has no subject');
  return {
    sub: payload.sub,
    email: String(payload.email ?? ''),
    name: String(payload.name ?? ''),
  };
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export async function issueRefreshToken(db: Db, userId: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86_400_000);
  await db.insert(refreshTokens).values({ userId, tokenHash: hashToken(token), expiresAt });
  return token;
}

/**
 * Exchange a refresh token for a fresh pair. The old row is revoked in the same
 * step, so a token that is presented twice is caught rather than honoured.
 */
export async function rotateRefreshToken(
  db: Db,
  token: string,
): Promise<{ userId: string; refreshToken: string } | null> {
  const tokenHash = hashToken(token);
  const revokedAt = new Date();

  const [row] = await db
    .update(refreshTokens)
    .set({ revokedAt })
    .where(and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)))
    .returning({ userId: refreshTokens.userId, expiresAt: refreshTokens.expiresAt });

  if (!row || row.expiresAt.getTime() < Date.now()) return null;

  const refreshToken = await issueRefreshToken(db, row.userId);
  return { userId: row.userId, refreshToken };
}

export async function revokeRefreshToken(db: Db, token: string): Promise<void> {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.tokenHash, hashToken(token)), isNull(refreshTokens.revokedAt)));
}

export async function revokeAllForUser(db: Db, userId: string): Promise<void> {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
}

/** Housekeeping: drop rows that are expired or long revoked. */
export async function pruneRefreshTokens(db: Db): Promise<void> {
  const cutoff = new Date(Date.now() - 7 * 86_400_000);
  await db
    .delete(refreshTokens)
    .where(or(lt(refreshTokens.expiresAt, new Date()), lt(refreshTokens.revokedAt, cutoff)));
}
