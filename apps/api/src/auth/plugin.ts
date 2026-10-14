/**
 * Turns a bearer token into `request.user`.
 *
 * Routes opt in by adding `preHandler: [app.requireAuth]`, so a route that
 * forgets to is simply unauthenticated rather than accidentally open to a
 * caller the handler assumes is signed in.
 */

import type { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { verifyAccessToken } from './tokens.ts';
import { unauthorized } from '../lib/errors.ts';

export interface AuthedUser {
  id: string;
  email: string;
  displayName: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthedUser;
  }
  interface FastifyInstance {
    requireAuth: (request: FastifyRequest) => Promise<void>;
  }
}

/** The signed-in user, or a 401. Use this instead of reading `request.user`. */
export function currentUser(request: FastifyRequest): AuthedUser {
  if (!request.user) throw unauthorized();
  return request.user;
}

async function authPlugin(app: FastifyInstance): Promise<void> {
  app.decorateRequest('user', undefined);

  app.decorate('requireAuth', async (request: FastifyRequest) => {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw unauthorized('This request needs a bearer token.');
    }

    try {
      const claims = await verifyAccessToken(header.slice('Bearer '.length).trim());
      request.user = { id: claims.sub, email: claims.email, displayName: claims.name };
    } catch {
      throw unauthorized('Your session has expired. Please sign in again.');
    }
  });
}

export default fp(authPlugin, { name: 'zbhaga-auth' });
