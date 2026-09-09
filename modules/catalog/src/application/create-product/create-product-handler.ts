import type {
  ExecutionContext,
} from '@versa/observability';

import {
  Money,
} from '@versa/shared-kernel';

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
  ProductBrand,
} from '../../domain/product/product-brand.js';

import {
  ProductCategoryNotAvailableError,
} from '../../domain/product/product-category-not-available-error.js';

import {
  ProductDescription,
} from '../../domain/product/product-description.js';

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
  readonly clock:
    Clock;

  readonly idGenerator:
    IdGenerator;

  readonly unitOfWork:
    CatalogUnitOfWork;
}

export class CreateProductHandler {
  constructor(
    private readonly dependencies:
      CreateProductHandlerDependencies,
  ) {}

  async execute(
    command:
      CreateProductCommand,

    context:
      ExecutionContext,
  ): Promise<
    CreateProductResult
  > {
    /*
     * Tudo que é validação local
     * ocorre antes da transação.
     */
    const tenantId =
      parseTenantId(
        command.tenantId,
      );

    const categoryId =
      parseCategoryId(
        command.categoryId,
      );

    const sku =
      ProductSku.create(
        command.sku,
      );

    const name =
      ProductName.create(
        command.name,
      );

    const brand =
      ProductBrand.create(
        command.brand,
      );

    const description =
      ProductDescription.create(
        command.description,
      );

    const costPrice =
      command.costPriceInCents ===
      undefined
        ? null
        : command.costPriceInCents ===
          null
          ? null
          : Money.fromCents(
              command.costPriceInCents,
            );

    const salePrice =
      command.salePriceInCents ===
      undefined
        ? null
        : command.salePriceInCents ===
          null
          ? null
          : Money.fromCents(
              command.salePriceInCents,
            );

    return this.dependencies
      .unitOfWork
      .execute(
        async (
          transaction,
        ) => {
          const categoryAvailable =
            await transaction
              .categories
              .isActiveById(
                tenantId,
                categoryId,
              );

          if (
            !categoryAvailable
          ) {
            throw new ProductCategoryNotAvailableError();
          }

          const product =
            Product.create(
              {
                tenantId,
                categoryId,
                sku,
                name,
                brand,
                description,
                costPrice,
                salePrice,
              },
              {
                clock:
                  this.dependencies
                    .clock,

                idGenerator:
                  this.dependencies
                    .idGenerator,

                eventContext: {
                  correlationId:
                    context
                      .correlationId,

                  causationId:
                    context
                      .executionId,
                },
              },
            );

          const events =
            product
              .pullDomainEvents();

          await transaction
            .products
            .insert(
              product,
            );

          await transaction
            .outbox
            .append(
              events,
            );

          return {
            id:
              product.id,

            tenantId:
              product.tenantId,

            sku:
              product.sku.value,

            name:
              product.name.value,

            categoryId:
              product.categoryId,

            brand:
              product.brand
                ?.value ??
              null,

            description:
              product.description
                ?.value ??
              null,

            costPriceInCents:
              product.costPrice
                ?.cents ??
              null,

            salePriceInCents:
              product.salePrice
                ?.cents ??
              null,

            status:
              product.status,

            createdAt:
              product.createdAt
                .toISOString(),

            updatedAt:
              product.updatedAt
                .toISOString(),
          };
        },
      );
  }
}