import type {
  Clock,
  IdGenerator,
} from '@versa/shared-kernel';

import {
  parseTenantId,
} from '../identifiers/tenant-id.js';

import type {
  TenantId,
} from '../identifiers/tenant-id.js';

import type {
  TenantName,
} from './tenant-name.js';

import {
  INITIAL_TENANT_STATUS,
} from './tenant-status.js';

import type {
  TenantStatus,
} from './tenant-status.js';

export interface CreateTenantInput {
  readonly name: TenantName;
}

export interface TenantCreationDependencies {
  readonly clock: Clock;
  readonly idGenerator: IdGenerator;
}

interface TenantState {
  readonly id: TenantId;
  readonly name: TenantName;
  readonly status: TenantStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Tenant {
  private constructor(
    private readonly state: TenantState,
  ) {}

  static create(
    input: CreateTenantInput,
    dependencies: TenantCreationDependencies,
  ): Tenant {
    const createdAt =
      dependencies.clock.now();

    const tenantId =
      parseTenantId(
        dependencies.idGenerator.generate(),
      );

    return new Tenant({
      id: tenantId,
      name: input.name,
      status: INITIAL_TENANT_STATUS,
      createdAt:
        new Date(createdAt.getTime()),
      updatedAt:
        new Date(createdAt.getTime()),
    });
  }

  get id(): TenantId {
    return this.state.id;
  }

  get name(): TenantName {
    return this.state.name;
  }

  get status(): TenantStatus {
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