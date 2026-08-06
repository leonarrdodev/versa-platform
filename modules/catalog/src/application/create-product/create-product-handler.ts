import type {
  Clock,
  IdGenerator,
} from '@versa/shared-kernel';

import {
  parseCategoryId,
} from '../../domain/identifiers/category-id.js';

import {
  parseTenantId,
} from '../../domain/identifiers/tenant-id.js';

import {
  Product,
} from '../../domain/product/product.js';

import {
  ProductName,
} from '../../domain/product/product-name.js';

import {
  ProductSku,
} from '../../domain/product/product-sku.js';

import type {
  CatalogUnitOfWork,
} from '../ports/catalog-unit-of-work.js';

import type {
  CreateProductCommand,
} from './create-product-command.js';

import type {
  CreateProductResult,
} from './create-product-result.js';

export interface CreateProductHandlerDependencies {
  readonly clock: Clock;
  readonly idGenerator: IdGenerator;
  readonly unitOfWork: CatalogUnitOfWork;
}

export class CreateProductHandler {
  constructor(
    private readonly dependencies:
      CreateProductHandlerDependencies,
  ) {}

  async execute(
    command: CreateProductCommand,
  ): Promise<CreateProductResult> {
    const tenantId = parseTenantId(
      command.tenantId,
    );

    const categoryId = parseCategoryId(
      command.categoryId,
    );

    const sku = ProductSku.create(
      command.sku,
    );

    const name = ProductName.create(
      command.name,
    );

    const product = Product.create(
      {
        tenantId,
        categoryId,
        sku,
        name,
      },
      {
        clock: this.dependencies.clock,
        idGenerator:
          this.dependencies.idGenerator,
      },
    );

    const events =
      product.pullDomainEvents();

    await this.dependencies.unitOfWork.execute(
      async (transaction) => {
        await transaction.products.insert(
          product,
        );

        await transaction.outbox.append(
          events,
        );
      },
    );

    return {
      id: product.id,
      tenantId: product.tenantId,
      sku: product.sku.value,
      name: product.name.value,
      categoryId: product.categoryId,
      status: product.status,
      createdAt:
        product.createdAt.toISOString(),
      updatedAt:
        product.updatedAt.toISOString(),
    };
  }
}