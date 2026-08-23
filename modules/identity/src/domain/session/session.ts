import {
  InvalidValueError,
} from '@versa/shared-kernel';

import type {
  Clock,
  IdGenerator,
} from '@versa/shared-kernel';

import {
  parseSessionId,
} from '../identifiers/session-id.js';

import type {
  SessionId,
} from '../identifiers/session-id.js';

import type {
  TenantId,
} from '../identifiers/tenant-id.js';

import type {
  UserId,
} from '../identifiers/user-id.js';

import type {
  SessionTokenHash,
} from './session-token-hash.js';

export interface CreateSessionInput {
  readonly userId:
    UserId;

  readonly activeTenantId:
    TenantId | null;

  readonly tokenHash:
    SessionTokenHash;

  readonly expiresAt:
    Date;
}

export interface SessionCreationDependencies {
  readonly clock:
    Clock;

  readonly idGenerator:
    IdGenerator;
}

interface SessionState {
  readonly id:
    SessionId;

  readonly userId:
    UserId;

  readonly activeTenantId:
    TenantId | null;

  readonly tokenHash:
    SessionTokenHash;

  readonly createdAt:
    Date;

  readonly expiresAt:
    Date;

  readonly lastSeenAt:
    Date;

  readonly revokedAt:
    Date | null;
}

export class Session {
  private constructor(
    private readonly state:
      SessionState,
  ) {}

  static create(
    input:
      CreateSessionInput,

    dependencies:
      SessionCreationDependencies,
  ): Session {
    const createdAt =
      dependencies.clock.now();

    if (
      input.expiresAt.getTime()
      <= createdAt.getTime()
    ) {
      throw new InvalidValueError(
        'Session expiration must be after creation',
      );
    }

    const sessionId =
      parseSessionId(
        dependencies.idGenerator
          .generate(),
      );

    return new Session({
      id:
        sessionId,

      userId:
        input.userId,

      activeTenantId:
        input.activeTenantId,

      tokenHash:
        input.tokenHash,

      createdAt:
        new Date(
          createdAt.getTime(),
        ),

      expiresAt:
        new Date(
          input.expiresAt.getTime(),
        ),

      lastSeenAt:
        new Date(
          createdAt.getTime(),
        ),

      revokedAt:
        null,
    });
  }

  get id():
    SessionId {
    return this.state.id;
  }

  get userId():
    UserId {
    return this.state.userId;
  }

  get activeTenantId():
    TenantId | null {
    return this.state
      .activeTenantId;
  }

  get tokenHash():
    SessionTokenHash {
    return this.state.tokenHash;
  }

  get createdAt():
    Date {
    return new Date(
      this.state.createdAt
        .getTime(),
    );
  }

  get expiresAt():
    Date {
    return new Date(
      this.state.expiresAt
        .getTime(),
    );
  }

  get lastSeenAt():
    Date {
    return new Date(
      this.state.lastSeenAt
        .getTime(),
    );
  }

  get revokedAt():
    Date | null {
    if (
      this.state.revokedAt ===
      null
    ) {
      return null;
    }

    return new Date(
      this.state.revokedAt
        .getTime(),
    );
  }

  isExpired(
    at: Date,
  ): boolean {
    return (
      this.state.expiresAt
        .getTime()
      <= at.getTime()
    );
  }

  isRevoked():
    boolean {
    return (
      this.state.revokedAt !==
      null
    );
  }

  isActive(
    at: Date,
  ): boolean {
    return (
      !this.isExpired(at)
      && !this.isRevoked()
    );
  }
}