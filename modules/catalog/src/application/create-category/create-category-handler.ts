import type {
  ExecutionContext,
} from '@versa/observability';

import type {
  Clock,
  IdGenerator,
} from '@versa/shared-kernel';

import {
  Category,
} from '../../domain/category/category.js';

import {
  CategoryName,
} from '../../domain/category/category-name.js';

import {
  parseTenantId,
} from '../../domain/identifiers/tenant-id.js';

import type {
  CatalogUnitOfWork,
} from '../ports/catalog-unit-of-work.js';

import type {
  CreateCategoryCommand,
} from './create-category-command.js';

import type {
  CreateCategoryResult,
} from './create-category-result.js';

export interface CreateCategoryHandlerDependencies {
  readonly clock: Clock;
  readonly idGenerator: IdGenerator;
  readonly unitOfWork: CatalogUnitOfWork;
}

export class CreateCategoryHandler {
  constructor(
    private readonly dependencies:
      CreateCategoryHandlerDependencies,
  ) {}

  async execute(
    command: CreateCategoryCommand,
    context: ExecutionContext,
  ): Promise<CreateCategoryResult> {
    const tenantId =
      parseTenantId(
        command.tenantId,
      );

    const name =
      CategoryName.create(
        command.name,
      );

    const category =
      Category.create(
        {
          tenantId,
          name,
        },
        {
          clock:
            this.dependencies.clock,

          idGenerator:
            this.dependencies.idGenerator,

          eventContext: {
            correlationId:
              context.correlationId,

            causationId:
              context.executionId,
          },
        },
      );

    const events =
      category.pullDomainEvents();

    await this.dependencies
      .unitOfWork
      .execute(
        async (transaction) => {
          await transaction
            .categories
            .insert(
              category,
            );

          await transaction
            .outbox
            .append(
              events,
            );
        },
      );

    return {
      id:
        category.id,

      tenantId:
        category.tenantId,

      name:
        category.name.value,

      status:
        category.status,

      createdAt:
        category.createdAt
          .toISOString(),

      updatedAt:
        category.updatedAt
          .toISOString(),
    };
  }
}