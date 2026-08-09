import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  parseUuid,
} from '@versa/shared-kernel';

import type {
  Clock,
  IdGenerator,
  Uuid,
} from '@versa/shared-kernel';

import {
  PRODUCT_CREATED_EVENT_NAME,
  PRODUCT_CREATED_EVENT_VERSION,
} from '@versa/event-contracts';

import {
  parseCategoryId,
  parseTenantId,
  Product,
  PRODUCT_AGGREGATE_TYPE,
  ProductName,
  ProductSku,
} from '../src/index.js';

class FixedClock implements Clock {
  constructor(
    private readonly fixedDate: Date,
  ) {}

  now(): Date {
    return new Date(
      this.fixedDate.getTime(),
    );
  }
}

class SequenceIdGenerator implements IdGenerator {
  private currentIndex = 0;

  constructor(
    private readonly values: readonly Uuid[],
  ) {}

  generate(): Uuid {
    const value = this.values[this.currentIndex];

    if (value === undefined) {
      throw new Error(
        'No UUID configured for this generation',
      );
    }

    this.currentIndex += 1;

    return value;
  }
}

const PRODUCT_ID = parseUuid(
  '11111111-1111-4111-8111-111111111111',
);

const EVENT_ID = parseUuid(
  '22222222-2222-4222-8222-222222222222',
);

const CORRELATION_ID = parseUuid(
  '55555555-5555-4555-8555-555555555555',
);

const CAUSATION_ID = parseUuid(
  '66666666-6666-4666-8666-666666666666',
);

const TENANT_ID = parseTenantId(
  '33333333-3333-4333-8333-333333333333',
);

const CATEGORY_ID = parseCategoryId(
  '44444444-4444-4444-8444-444444444444',
);

const FIXED_DATE = new Date(
  '2026-08-04T01:00:00.000Z',
);

function createProduct(): Product {
  const clock = new FixedClock(FIXED_DATE);

  const idGenerator = new SequenceIdGenerator([
    PRODUCT_ID,
    EVENT_ID,
  ]);

  return Product.create(
    {
      tenantId: TENANT_ID,
      sku: ProductSku.create('blusa-001'),
      name: ProductName.create(
        'Blusa Canelada Feminina',
      ),
      categoryId: CATEGORY_ID,
    },
    {
      clock,
  idGenerator,

  eventContext: {
    correlationId:
      CORRELATION_ID,

    causationId:
      CAUSATION_ID,
  },
    },
  );
}

describe('Product', () => {
  it('creates a product with its domain data', () => {
    const product = createProduct();

    expect(product.id).toBe(PRODUCT_ID);
    expect(product.tenantId).toBe(TENANT_ID);
    expect(product.sku.value).toBe('BLUSA-001');

    expect(product.name.value).toBe(
      'Blusa Canelada Feminina',
    );

    expect(product.categoryId).toBe(
      CATEGORY_ID,
    );
  });

  it('starts the product with draft status', () => {
    const product = createProduct();

    expect(product.status).toBe('draft');
  });

  it('uses the injected clock for timestamps', () => {
    const product = createProduct();

    expect(product.createdAt.toISOString()).toBe(
      '2026-08-04T01:00:00.000Z',
    );

    expect(product.updatedAt.toISOString()).toBe(
      '2026-08-04T01:00:00.000Z',
    );
  });

  it('protects its dates against external mutation', () => {
    const product = createProduct();

    const createdAt = product.createdAt;

    createdAt.setFullYear(2000);

    expect(product.createdAt.toISOString()).toBe(
      '2026-08-04T01:00:00.000Z',
    );
  });

  it('records ProductCreated when created', () => {
    const product = createProduct();

    const events = product.pullDomainEvents();

    expect(events).toHaveLength(1);

    const event = events[0];

    if (event === undefined) {
      throw new Error(
        'Expected ProductCreated event',
      );
    }

    expect(event).toEqual({
      eventId: EVENT_ID,
      eventName: PRODUCT_CREATED_EVENT_NAME,
      eventVersion: PRODUCT_CREATED_EVENT_VERSION,
      tenantId: TENANT_ID,
      correlationId: CORRELATION_ID,
      causationId: CAUSATION_ID,
      aggregateType: PRODUCT_AGGREGATE_TYPE,
      aggregateId: PRODUCT_ID,
      occurredAt: '2026-08-04T01:00:00.000Z',
      payload: {
        productId: PRODUCT_ID,
        sku: 'BLUSA-001',
        name: 'Blusa Canelada Feminina',
        categoryId: CATEGORY_ID,
        createdAt: '2026-08-04T01:00:00.000Z',
      },
    });
  });

  it('keeps tenantId in the event envelope', () => {
    const product = createProduct();

    const events = product.pullDomainEvents();
    const event = events[0];

    if (event === undefined) {
      throw new Error(
        'Expected ProductCreated event',
      );
    }

    expect(event.tenantId).toBe(TENANT_ID);

    expect(event.payload).not.toHaveProperty(
      'tenantId',
    );
  });

  it('clears pending events after pulling them', () => {
    const product = createProduct();

    expect(product.pullDomainEvents()).toHaveLength(1);
    expect(product.pullDomainEvents()).toHaveLength(0);
  });
});