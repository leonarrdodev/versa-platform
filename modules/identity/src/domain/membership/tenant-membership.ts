import type {
  Clock,
} from '@versa/shared-kernel';

import type {
  TenantId,
} from '../identifiers/tenant-id.js';

import type {
  UserId,
} from '../identifiers/user-id.js';

import type {
  MembershipRole,
} from './membership-role.js';

import {
  INITIAL_MEMBERSHIP_STATUS,
} from './membership-status.js';

import type {
  MembershipStatus,
} from './membership-status.js';

export interface CreateTenantMembershipInput {
  readonly userId: UserId;
  readonly tenantId: TenantId;
  readonly role: MembershipRole;
}

export interface TenantMembershipCreationDependencies {
  readonly clock: Clock;
}

interface TenantMembershipState {
  readonly userId: UserId;
  readonly tenantId: TenantId;
  readonly role: MembershipRole;
  readonly status: MembershipStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class TenantMembership {
  private constructor(
    private readonly state:
      TenantMembershipState,
  ) {}

  static create(
    input: CreateTenantMembershipInput,
    dependencies:
      TenantMembershipCreationDependencies,
  ): TenantMembership {
    const createdAt =
      dependencies.clock.now();

    return new TenantMembership({
      userId: input.userId,
      tenantId: input.tenantId,
      role: input.role,
      status:
        INITIAL_MEMBERSHIP_STATUS,
      createdAt:
        new Date(createdAt.getTime()),
      updatedAt:
        new Date(createdAt.getTime()),
    });
  }

  get userId(): UserId {
    return this.state.userId;
  }

  get tenantId(): TenantId {
    return this.state.tenantId;
  }

  get role(): MembershipRole {
    return this.state.role;
  }

  get status(): MembershipStatus {
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