import type {
  AuthenticationIdentity,
} from '../authentication/authentication-identity.js';

export interface AuthenticationRepository {
  findByNormalizedEmail(
    normalizedEmail: string,
  ): Promise<
    AuthenticationIdentity | null
  >;
}