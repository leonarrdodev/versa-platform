import type {
  Clock,
} from '@versa/shared-kernel';

import type {
  SessionAuthenticationRepository,
} from '../ports/session-authentication-repository.js';

import type {
  SessionTokenHasher,
} from '../ports/session-token-hasher.js';

import {
  InvalidSessionError,
} from './invalid-session-error.js';

import type {
  ResolveSessionResult,
} from './resolve-session-result.js';

export interface ResolveSessionHandlerDependencies {
  readonly clock:
    Clock;

  readonly tokenHasher:
    SessionTokenHasher;

  readonly authenticationRepository:
    SessionAuthenticationRepository;
}

export class ResolveSessionHandler {
  constructor(
    private readonly dependencies:
      ResolveSessionHandlerDependencies,
  ) {}

  async execute(
    rawToken: string,
  ): Promise<
    ResolveSessionResult
  > {
    if (
      rawToken.length === 0
    ) {
      throw new InvalidSessionError();
    }

    const tokenHash =
      this.dependencies
        .tokenHasher
        .hash(
          rawToken,
        );

    const authentication =
      await this.dependencies
        .authenticationRepository
        .findByTokenHash(
          tokenHash,
        );

    if (
      authentication === null
    ) {
      throw new InvalidSessionError();
    }

    const now =
      this.dependencies
        .clock
        .now();

    if (
      authentication.revokedAt !==
        null
      ||
      authentication.expiresAt
        .getTime()
        <= now.getTime()
    ) {
      throw new InvalidSessionError();
    }

    if (
      authentication.userStatus !==
      'active'
    ) {
      throw new InvalidSessionError();
    }

    if (
      authentication.activeTenantId !==
      null
    ) {
      if (
        authentication.tenantStatus !==
          'active'
        ||
        authentication.membershipStatus !==
          'active'
        ||
        authentication.membershipRole ===
          null
      ) {
        throw new InvalidSessionError();
      }

      return {
        sessionId:
          authentication.sessionId,

        user: {
          id:
            authentication.userId,

          email:
            authentication.email,

          displayName:
            authentication.displayName,
        },

        activeTenant: {
          id:
            authentication.activeTenantId,

          role:
            authentication.membershipRole,
        },

        expiresAt:
          authentication.expiresAt
            .toISOString(),
      };
    }

    return {
      sessionId:
        authentication.sessionId,

      user: {
        id:
          authentication.userId,

        email:
          authentication.email,

        displayName:
          authentication.displayName,
      },

      activeTenant:
        null,

      expiresAt:
        authentication.expiresAt
          .toISOString(),
    };
  }
}