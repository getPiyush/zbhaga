/**
 * Assembles the Fastify instance. Kept separate from `server.ts` so tests can
 * build an app and call it in-process without binding a port.
 */

import Fastify, { type FastifyError, type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { ZodError } from 'zod';
import { SplitError } from '@zbhaga/shared';
import { corsOrigins, env, isProduction, authDisabled } from './env.ts';
import authPlugin from './auth/plugin.ts';
import authRoutes from './routes/auth.ts';
import groupRoutes from './routes/groups.ts';
import expenseRoutes from './routes/expenses.ts';
import paymentRoutes from './routes/payments.ts';
import balanceRoutes from './routes/balances.ts';
import debugRoutes from './routes/debug.ts';
import { HttpError } from './lib/errors.ts';

export interface BuildOptions {
  logger?: boolean;
  /**
   * Rate limiting is on everywhere except the test suite, which would
   * otherwise throttle its own fixtures rather than the behaviour under test.
   */
  rateLimit?: boolean;
}

export async function buildApp(options: BuildOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      options.logger === false
        ? false
        : {
            level: isProduction ? 'info' : 'debug',
            // Never let a token or a password reach the log.
            redact: ['req.headers.authorization', 'req.headers.cookie', 'body.password'],
          },
    // Trust the proxy so rate limiting sees the real client address.
    trustProxy: isProduction,
    bodyLimit: 256 * 1024,
  });

  await app.register(cors, {
    origin: (origin, callback) => {
      // Native apps and server-to-server calls send no Origin at all.
      if (!origin || corsOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Origin not allowed'), false);
    },
    credentials: true,
  });

  const rateLimitEnabled = options.rateLimit ?? env.NODE_ENV !== 'test';

  if (rateLimitEnabled) {
    await app.register(rateLimit, {
      max: env.RATE_LIMIT_MAX,
      timeWindow: '1 minute',
      // Signing in is the endpoint worth guarding; it gets a tighter budget below.
      keyGenerator: (request) => request.ip,
    });
  }

  await app.register(authPlugin);

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof HttpError) {
      return reply.code(error.statusCode).send({
        error: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      });
    }

    if (error instanceof SplitError) {
      return reply.code(400).send({ error: 'bad_request', message: error.message });
    }

    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: 'bad_request',
        message: 'That request is not valid.',
        details: error.issues,
      });
    }

    if (error.statusCode && error.statusCode < 500) {
      return reply.code(error.statusCode).send({
        error: error.code ?? 'request_failed',
        message: error.message,
      });
    }

    // Anything unrecognised is a bug. Log it in full, tell the client nothing.
    request.log.error({ err: error }, 'Unhandled error');
    return reply.code(500).send({
      error: 'internal_error',
      message: 'Something went wrong on our side.',
    });
  });

  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({ error: 'not_found', message: `No route for ${request.method} ${request.url}.` });
  });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'zbhaga-api',
    environment: env.NODE_ENV,
    time: new Date().toISOString(),
    authDisabled,
  }));

  if (!authDisabled) {
    // Auth endpoints get their own, much tighter budget.
    await app.register(async (scope) => {
      if (rateLimitEnabled) {
        await scope.register(rateLimit, { max: env.AUTH_RATE_LIMIT_MAX, timeWindow: '1 minute' });
      }
      await scope.register(authRoutes);
    });
  }

  await app.register(groupRoutes);
  await app.register(expenseRoutes);
  await app.register(paymentRoutes);
  await app.register(balanceRoutes);
  await app.register(debugRoutes);

  return app;
}
