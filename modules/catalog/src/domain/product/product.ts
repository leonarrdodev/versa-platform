import {
  PRODUCT_CREATED_EVENT_NAME,
  PRODUCT_CREATED_EVENT_VERSION,
} from '@versa/event-contracts';

import type {
  DomainEventTraceContext,
  ProductCreatedEvent,
} from '@versa/event-contracts';

import type {
  Clock,
  IdGenerator,
} from '@versa/shared-kernel';

import type {
  Money,
} from '@versa/shared-kernel';

import type {
  CategoryId,
} from '../identifiers/category-id.js';

import type {
  ProductId,
} from '../identifiers/product-id.js';

import {
  productIdFromUuid,
} from '../identifiers/product-id.js';

import type {
  TenantId,
} from '../identifiers/tenant-id.js';

import type {
  ProductBrand,
} from './product-brand.js';

import type {
  ProductDescription,
} from './product-description.js';

import type {
  ProductName,
} from './product-name.js';

import type {
  ProductSku,
} from './product-sku.js';

import {
  INITIAL_PRODUCT_STATUS,
} from './product-status.js';

import type {
  ProductStatus,
} from './product-status.js';

export const PRODUCT_AGGREGATE_TYPE =
  'Product';

export interface CreateProductInput {
  readonly tenantId:
    TenantId;

  readonly sku:
    ProductSku;

  readonly name:
    ProductName;

  readonly categoryId:
    CategoryId;

  readonly brand?:
    ProductBrand | null;

  readonly description?:
    ProductDescription | null;

  readonly costPrice?:
    Money | null;

  readonly salePrice?:
    Money | null;
}

export interface ProductCreationDependencies {
  readonly clock:
    Clock;

  readonly idGenerator:
    IdGenerator;

  readonly eventContext:
    DomainEventTraceContext;
}

interface ProductState {
  readonly id:
    ProductId;

  readonly tenantId:
    TenantId;

  readonly sku:
    ProductSku;

  readonly name:
    ProductName;

  readonly categoryId:
    CategoryId;

  readonly brand:
    ProductBrand | null;

  readonly description:
    ProductDescription | null;

  readonly costPrice:
    Money | null;

  readonly salePrice:
    Money | null;

  readonly status:
    ProductStatus;

  readonly createdAt:
    Date;

  readonly updatedAt:
    Date;
}

export class Product {
  private readonly pendingEvents:
    ProductCreatedEvent[] = [];

  private constructor(
    private readonly state:
      ProductState,
  ) {}

  static create(
    input:
      CreateProductInput,

    dependencies:
      ProductCreationDependencies,
  ): Product {
    const createdAt =
      dependencies.clock.now();

    const productId =
      productIdFromUuid(
        dependencies
          .idGenerator
          .generate(),
      );

    const eventId =
      dependencies
        .idGenerator
        .generate();

    const brand =
      input.brand ??
      null;

    const description =
      input.description ??
      null;

    const costPrice =
      input.costPrice ??
      null;

    const salePrice =
      input.salePrice ??
      null;

    const product =
      new Product({
        id:
          productId,

        tenantId:
          input.tenantId,

        sku:
          input.sku,

        name:
          input.name,

        categoryId:
          input.categoryId,

        brand,

        description,

        costPrice,

        salePrice,

        status:
          INITIAL_PRODUCT_STATUS,

        createdAt:
          new Date(
            createdAt.getTime(),
          ),

        updatedAt:
          new Date(
            createdAt.getTime(),
          ),
      });

    product.pendingEvents.push({
      eventId,

      eventName:
        PRODUCT_CREATED_EVENT_NAME,

      eventVersion:
        PRODUCT_CREATED_EVENT_VERSION,

      tenantId:
        input.tenantId,

      correlationId:
        dependencies
          .eventContext
          .correlationId,

      causationId:
        dependencies
          .eventContext
          .causationId,

      aggregateType:
        PRODUCT_AGGREGATE_TYPE,

      aggregateId:
        productId,

      occurredAt:
        createdAt
          .toISOString(),

      payload: {
        productId,

        sku:
          input.sku.value,

        name:
          input.name.value,

        ...(brand ===
        null
          ? {}
          : {
              brand:
                brand.value,
            }),

        ...(description ===
        null
          ? {}
          : {
              description:
                description.value,
            }),

        ...(costPrice ===
        null
          ? {}
          : {
              costPriceInCents:
                costPrice.cents,
            }),

        ...(salePrice ===
        null
          ? {}
          : {
              salePriceInCents:
                salePrice.cents,
            }),

        categoryId:
          input.categoryId,

        createdAt:
          createdAt
            .toISOString(),
      },
    });

    return product;
  }

  get id():
  ProductId {
    return this.state.id;
  }

  get tenantId():
  TenantId {
    return this.state
      .tenantId;
  }

  get sku():
  ProductSku {
    return this.state.sku;
  }

  get name():
  ProductName {
    return this.state.name;
  }

  get categoryId():
  CategoryId {
    return this.state
      .categoryId;
  }

  get brand():
  ProductBrand | null {
    return this.state
      .brand;
  }

  get description():
  ProductDescription | null {
    return this.state
      .description;
  }

  get costPrice():
  Money | null {
    return this.state
      .costPrice;
  }

  get salePrice():
  Money | null {
    return this.state
      .salePrice;
  }

  get status():
  ProductStatus {
    return this.state
      .status;
  }

  get createdAt():
  Date {
    return new Date(
      this.state
        .createdAt
        .getTime(),
    );
  }

  get updatedAt():
  Date {
    return new Date(
      this.state
        .updatedAt
        .getTime(),
    );
  }

  pullDomainEvents():
  ProductCreatedEvent[] {
    const events = [
      ...this.pendingEvents,
    ];

    this.pendingEvents.length =
      0;

    return events;
  }
}