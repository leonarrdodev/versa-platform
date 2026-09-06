import type {
  ExecutionContext,
} from '@versa/observability';

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
  ProductCategoryNotAvailableError,
} from '../../domain/product/product-category-not-available-error.js';

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
     * Validações puramente locais
     * acontecem antes da transação.
     *
     * Assim um comando malformado
     * não abre conexão/transação
     * desnecessariamente.
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

    return this.dependencies
      .unitOfWork
      .execute(
        async (
          transaction,
        ) => {
          /*
           * Essa validação ocorre
           * DENTRO da mesma transação
           * que persistirá Product
           * e ProductCreated.
           *
           * O repository PostgreSQL
           * também bloqueia a Category
           * com FOR SHARE enquanto
           * esta transação existir.
           */
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

          /*
           * Só geramos Product e
           * ProductCreated depois de
           * confirmar a Category.
           */
          const product =
            Product.create(
              {
                tenantId,
                categoryId,
                sku,
                name,
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