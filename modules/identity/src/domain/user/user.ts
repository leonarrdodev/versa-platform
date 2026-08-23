import type {
  Clock,
  IdGenerator,
} from '@versa/shared-kernel';

import {
  parseUserId,
} from '../identifiers/user-id.js';

import type {
  UserId,
} from '../identifiers/user-id.js';

import type {
  DisplayName,
} from './display-name.js';

import type {
  Email,
} from './email.js';

import {
  INITIAL_USER_STATUS,
} from './user-status.js';

import type {
  UserStatus,
} from './user-status.js';

export interface CreateUserInput {
  readonly email: Email;
  readonly displayName: DisplayName;
}

export interface UserCreationDependencies {
  readonly clock: Clock;
  readonly idGenerator: IdGenerator;
}

interface UserState {
  readonly id: UserId;
  readonly email: Email;
  readonly displayName: DisplayName;
  readonly status: UserStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class User {
  private constructor(
    private readonly state: UserState,
  ) {}

  static create(
    input: CreateUserInput,
    dependencies: UserCreationDependencies,
  ): User {
    const createdAt =
      dependencies.clock.now();

    const userId =
      parseUserId(
        dependencies.idGenerator.generate(),
      );

    return new User({
      id: userId,
      email: input.email,
      displayName: input.displayName,
      status: INITIAL_USER_STATUS,
      createdAt:
        new Date(createdAt.getTime()),
      updatedAt:
        new Date(createdAt.getTime()),
    });
  }

  get id(): UserId {
    return this.state.id;
  }

  get email(): Email {
    return this.state.email;
  }

  get displayName(): DisplayName {
    return this.state.displayName;
  }

  get status(): UserStatus {
    return this.state.status;
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