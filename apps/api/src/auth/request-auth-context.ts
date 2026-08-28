import type {
  ResolveSessionResult,
} from '@versa/identity';

/*
 * O contexto HTTP autenticado nasce
 * diretamente do resultado validado
 * pelo Identity.
 *
 * A API não precisa reconstruir
 * manualmente User/Tenant/Role.
 */
export type RequestAuthContext =
  ResolveSessionResult;