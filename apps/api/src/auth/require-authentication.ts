import type {
  ResolveSessionHandler,
} from '@versa/identity';

import type {
  FastifyRequest,
} from 'fastify';

import {
  SESSION_COOKIE_NAME,
} from './session-cookie.js';

export type RequireAuthentication =
  (
    request:
      FastifyRequest,
  ) => Promise<void>;

export interface RequireAuthenticationDependencies {
  readonly resolveSessionHandler:
    ResolveSessionHandler;
}

export function createRequireAuthentication(
  dependencies:
    RequireAuthenticationDependencies,
): RequireAuthentication {
  return async function requireAuthentication(
    request:
      FastifyRequest,
  ): Promise<void> {
    const rawToken =
      request.cookies[
        SESSION_COOKIE_NAME
      ] ?? '';

    const auth =
      await dependencies
        .resolveSessionHandler
        .execute(
          rawToken,
        );

    request.auth =
      auth;
  };
}