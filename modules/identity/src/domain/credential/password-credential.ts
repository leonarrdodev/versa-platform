import type {
  Clock,
} from '@versa/shared-kernel';

import type {
  UserId,
} from '../identifiers/user-id.js';

import type {
  PasswordHash,
} from './password-hash.js';

export interface CreatePasswordCredentialInput {
  readonly userId: UserId;
  readonly passwordHash: PasswordHash;
}

export interface PasswordCredentialCreationDependencies {
  readonly clock: Clock;
}

interface PasswordCredentialState {
  readonly userId: UserId;
  readonly passwordHash:
    PasswordHash;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class PasswordCredential {
  private constructor(
    private readonly state:
      PasswordCredentialState,
  ) {}

  static create(
    input:
      CreatePasswordCredentialInput,

    dependencies:
      PasswordCredentialCreationDependencies,
  ): PasswordCredential {
    const createdAt =
      dependencies.clock.now();

    return new PasswordCredential({
      userId: input.userId,

      passwordHash:
        input.passwordHash,

      createdAt:
        new Date(
          createdAt.getTime(),
        ),

      updatedAt:
        new Date(
          createdAt.getTime(),
        ),
    });
  }

  get userId(): UserId {
    return this.state.userId;
  }

  get passwordHash():
    PasswordHash {
    return this.state.passwordHash;
  }

  get createdAt(): Date {
    return new Date(
      this.state.createdAt.getTime(),
    );
  }

  get updatedAt(): Date {
    return new Date(
      this.state.updatedAt.getTime(),
    );
  }
}