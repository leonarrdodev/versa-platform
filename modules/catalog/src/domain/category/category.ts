import {
  CATEGORY_CREATED_EVENT_NAME,
  CATEGORY_CREATED_EVENT_VERSION,
} from '@versa/event-contracts';

import type {
  CategoryCreatedEvent,
  DomainEventTraceContext,
} from '@versa/event-contracts';

import type {
  Clock,
  IdGenerator,
} from '@versa/shared-kernel';

import {
  categoryIdFromUuid,
} from '../identifiers/category-id.js';

import type {
  CategoryId,
} from '../identifiers/category-id.js';

import type {
  TenantId,
} from '../identifiers/tenant-id.js';

import type {
  CategoryName,
} from './category-name.js';

import {
  INITIAL_CATEGORY_STATUS,
} from './category-status.js';

import type {
  CategoryStatus,
} from './category-status.js';

export const CATEGORY_AGGREGATE_TYPE =
  'Category';

export interface CreateCategoryInput {
  readonly tenantId: TenantId;
  readonly name: CategoryName;
}

export interface CategoryCreationDependencies {
  readonly clock: Clock;
  readonly idGenerator: IdGenerator;

  readonly eventContext:
    DomainEventTraceContext;
}

interface CategoryState {
  readonly id: CategoryId;
  readonly tenantId: TenantId;
  readonly name: CategoryName;
  readonly status: CategoryStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Category {
  private readonly pendingEvents:
    CategoryCreatedEvent[] = [];

  private constructor(
    private readonly state: CategoryState,
  ) {}

  static create(
    input: CreateCategoryInput,
    dependencies: CategoryCreationDependencies,
  ): Category {
    const createdAt =
      dependencies.clock.now();

    const categoryId =
      categoryIdFromUuid(
        dependencies.idGenerator.generate(),
      );

    const eventId =
      dependencies.idGenerator.generate();

    const category =
      new Category({
        id: categoryId,
        tenantId: input.tenantId,
        name: input.name,
        status:
          INITIAL_CATEGORY_STATUS,
        createdAt:
          new Date(createdAt.getTime()),
        updatedAt:
          new Date(createdAt.getTime()),
      });

    category.pendingEvents.push({
      eventId,

      eventName:
        CATEGORY_CREATED_EVENT_NAME,

      eventVersion:
        CATEGORY_CREATED_EVENT_VERSION,

      tenantId:
        input.tenantId,

      correlationId:
        dependencies.eventContext
          .correlationId,

      causationId:
        dependencies.eventContext
          .causationId,

      aggregateType:
        CATEGORY_AGGREGATE_TYPE,

      aggregateId:
        categoryId,

      occurredAt:
        createdAt.toISOString(),

      payload: {
        categoryId,
        name:
          input.name.value,
        status:
          INITIAL_CATEGORY_STATUS,
        createdAt:
          createdAt.toISOString(),
      },
    });

    return category;
  }

  get id(): CategoryId {
    return this.state.id;
  }

  get tenantId(): TenantId {
    return this.state.tenantId;
  }

  get name(): CategoryName {
    return this.state.name;
  }

  get status(): CategoryStatus {
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

  pullDomainEvents():
    CategoryCreatedEvent[] {
    const events = [
      ...this.pendingEvents,
    ];

    this.pendingEvents.length = 0;

    return events;
  }
}