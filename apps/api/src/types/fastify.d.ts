import type {
  RequestAuthContext,
} from '../auth/request-auth-context.js';

declare module 'fastify' {
  interface FastifyRequest {
    auth:
      RequestAuthContext | null;
  }
}

export {};