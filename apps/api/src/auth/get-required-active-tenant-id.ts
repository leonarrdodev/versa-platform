import type {
  FastifyRequest,
} from 'fastify';

import {
  ActiveTenantRequiredError,
} from './active-tenant-required-error.js';

export function getRequiredActiveTenantId(
  request:
    FastifyRequest,
): string {
  /*
   * Se auth estiver null depois do
   * preHandler, temos um bug interno
   * de configuração, não uma falha
   * normal de autenticação.
   */
  if (
    request.auth ===
    null
  ) {
    throw new Error(
      'Authenticated request context is missing',
    );
  }

  if (
    request.auth.activeTenant ===
    null
  ) {
    throw new ActiveTenantRequiredError();
  }

  return request.auth
    .activeTenant
    .id;
}