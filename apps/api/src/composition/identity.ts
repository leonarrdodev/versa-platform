import {
  Argon2PasswordHasher,
  CreateSessionHandler,
  CryptoSessionTokenGenerator,
  LoginHandler,
  PostgresAuthenticationRepository,
  PostgresSessionAuthenticationRepository,
  PostgresSessionRepository,
  PostgresSessionRevocationRepository,
  ResolveSessionHandler,
  RevokeSessionHandler,
  Sha256SessionTokenHasher,
  SignInHandler,
} from '@versa/identity';

import {
  createDatabasePool,
} from '@versa/database';

import {
  RandomUuidGenerator,
  SystemClock,
} from '@versa/shared-kernel';

type DatabasePool =
  ReturnType<
    typeof createDatabasePool
  >;

const SESSION_DURATION_MS =
  7
  * 24
  * 60
  * 60
  * 1000;

export interface IdentityComposition {
  readonly signInHandler:
    SignInHandler;

  readonly resolveSessionHandler:
    ResolveSessionHandler;

  readonly revokeSessionHandler:
    RevokeSessionHandler;
}

export function createIdentityComposition(
  pool: DatabasePool,
): IdentityComposition {
  const clock =
    new SystemClock();

  const idGenerator =
    new RandomUuidGenerator();

  const passwordHasher =
    new Argon2PasswordHasher();

  const tokenGenerator =
    new CryptoSessionTokenGenerator();

  const tokenHasher =
    new Sha256SessionTokenHasher();

  const authenticationRepository =
    new PostgresAuthenticationRepository(
      pool,
    );

  const sessionRepository =
    new PostgresSessionRepository(
      pool,
    );

  const sessionAuthenticationRepository =
    new PostgresSessionAuthenticationRepository(
      pool,
    );

  const sessionRevocationRepository =
    new PostgresSessionRevocationRepository(
      pool,
    );

  const loginHandler =
    new LoginHandler({
      authenticationRepository,
      passwordHasher,
    });

  const createSessionHandler =
    new CreateSessionHandler({
      clock,
      idGenerator,
      tokenGenerator,
      tokenHasher,
      sessionRepository,
      sessionDurationMs:
        SESSION_DURATION_MS,
    });

  const signInHandler =
    new SignInHandler({
      loginHandler,
      createSessionHandler,
    });

  const resolveSessionHandler =
    new ResolveSessionHandler({
      clock,
      tokenHasher,

      authenticationRepository:
        sessionAuthenticationRepository,
    });

  const revokeSessionHandler =
    new RevokeSessionHandler({
      clock,
      tokenHasher,

      revocationRepository:
        sessionRevocationRepository,
    });

  return {
    signInHandler,
    resolveSessionHandler,
    revokeSessionHandler,
  };
}