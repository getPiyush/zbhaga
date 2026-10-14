/**
 * Configuration, read once at boot and validated. A missing secret should stop
 * the process here rather than surface as a confusing 500 later.
 */

import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default('0.0.0.0'),

  /**
   * A `postgres://` URL uses the real driver. Anything else (or nothing) falls
   * back to PGlite, an embedded Postgres that needs no install - same dialect,
   * so moving to a managed Postgres is only this variable.
   */
  DATABASE_URL: z.string().default('pglite://.pgdata'),

  /** Signs access tokens. Must be at least 32 chars in production. */
  JWT_SECRET: z.string().min(16).default('dev-only-insecure-secret-change-me'),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(15 * 60),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),

  /** Requests per minute per IP, and the tighter budget for sign-in routes. */
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),

  /** Comma-separated origins allowed to call the API from a browser. */
  CORS_ORIGINS: z.string().default('http://localhost:8081,http://localhost:19006'),

  /** Where the app lives, used to build OAuth redirect URLs. */
  PUBLIC_APP_URL: z.string().default('http://localhost:8081'),
  PUBLIC_API_URL: z.string().default('http://localhost:4000'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),
  /** `common` lets both work and personal Microsoft accounts sign in. */
  MICROSOFT_TENANT: z.string().default('common'),

  OKTA_CLIENT_ID: z.string().optional(),
  OKTA_CLIENT_SECRET: z.string().optional(),
  OKTA_DOMAIN: z.string().optional(),

  /** Set to 'true' to disable all authentication (not recommended for production). */
  AUTH_DISABLED: z.enum(['true', 'false']).default('false'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('\n');
  throw new Error(`zBhaga API cannot start, the configuration is not valid:\n${issues}`);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';

if (isProduction) {
  if (env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  if (env.DATABASE_URL.startsWith('pglite://')) {
    throw new Error('DATABASE_URL must point at a real Postgres in production');
  }
}

export const corsOrigins = env.CORS_ORIGINS.split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export const authDisabled = env.AUTH_DISABLED === 'true';

export const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
export const microsoftEnabled = Boolean(env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET);
export const oktaEnabled = Boolean(env.OKTA_CLIENT_ID && env.OKTA_CLIENT_SECRET && env.OKTA_DOMAIN);
