import type {
  Clock,
} from '@versa/shared-kernel';

import type {
  SessionRevocationRepository,
} from '../ports/session-revocation-repository.js';

import type {
  SessionTokenHasher,
} from '../ports/session-token-hasher.js';

export interface RevokeSessionHandlerDependencies {
  readonly clock:
    Clock;

  readonly tokenHasher:
    SessionTokenHasher;

  readonly revocationRepository:
    SessionRevocationRepository;
}

export class RevokeSessionHandler {
  constructor(
    private readonly dependencies:
      RevokeSessionHandlerDependencies,
  ) {}

  async execute(
    rawToken: string,
  ): Promise<void> {
    /*
     * Logout é intencionalmente
     * idempotente.
     *
     * Um token vazio simplesmente
     * representa ausência de uma
     * sessão utilizável.
     */
    if (
      rawToken.length === 0
    ) {
      return;
    }

    const tokenHash =
      this.dependencies
        .tokenHasher
        .hash(
          rawToken,
        );

    const revokedAt =
      this.dependencies
        .clock
        .now();

    await this.dependencies
      .revocationRepository
      .revokeByTokenHash(
        tokenHash,
        revokedAt,
      );
  }
}