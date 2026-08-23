import type {
  Clock,
  IdGenerator,
} from '@versa/shared-kernel';

import {
  parseTenantId,
} from '../../domain/identifiers/tenant-id.js';

import {
  parseUserId,
} from '../../domain/identifiers/user-id.js';

import {
  Session,
} from '../../domain/session/session.js';

import type {
  SessionRepository,
} from '../ports/session-repository.js';

import type {
  SessionTokenGenerator,
} from '../ports/session-token-generator.js';

import type {
  SessionTokenHasher,
} from '../ports/session-token-hasher.js';

import type {
  CreateSessionCommand,
} from './create-session-command.js';

import type {
  CreateSessionResult,
} from './create-session-result.js';

export interface CreateSessionHandlerDependencies {
  readonly clock:
    Clock;

  readonly idGenerator:
    IdGenerator;

  readonly tokenGenerator:
    SessionTokenGenerator;

  readonly tokenHasher:
    SessionTokenHasher;

  readonly sessionRepository:
    SessionRepository;

  readonly sessionDurationMs:
    number;
}

export class CreateSessionHandler {
  constructor(
    private readonly dependencies:
      CreateSessionHandlerDependencies,
  ) {}

  async execute(
    command: CreateSessionCommand,
  ): Promise<CreateSessionResult> {
    const userId =
      parseUserId(
        command.userId,
      );

    const activeTenantId =
      command.activeTenantId ===
        null
        ? null
        : parseTenantId(
            command.activeTenantId,
          );

    const now =
      this.dependencies
        .clock
        .now();

    const expiresAt =
      new Date(
        now.getTime()
        + this.dependencies
          .sessionDurationMs,
      );

    const rawToken =
      this.dependencies
        .tokenGenerator
        .generate();

    const tokenHash =
      this.dependencies
        .tokenHasher
        .hash(
          rawToken,
        );

    const session =
      Session.create(
        {
          userId,

          activeTenantId,

          tokenHash,

          expiresAt,
        },
        {
          clock:
            this.dependencies.clock,

          idGenerator:
            this.dependencies
              .idGenerator,
        },
      );

    await this.dependencies
      .sessionRepository
      .insert(
        session,
      );

    return {
      sessionId:
        session.id,

      token:
        rawToken,

      userId:
        session.userId,

      activeTenantId:
        session.activeTenantId,

      expiresAt:
        session.expiresAt
          .toISOString(),
    };
  }
}