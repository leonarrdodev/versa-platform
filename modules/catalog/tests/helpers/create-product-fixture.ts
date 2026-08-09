import type {
  ProductCreatedEvent,
} from '@versa/event-contracts';

import {
  parseUuid,
} from '@versa/shared-kernel';

import type {
  Clock,
  IdGenerator,
  Uuid,
} from '@versa/shared-kernel';

import {
  parseCategoryId,
  parseTenantId,
  Product,
  ProductName,
  ProductSku,
} from '../../src/index.js';

export const PRODUCT_ID = parseUuid(
  '11111111-1111-4111-8111-111111111111',
);

export const EVENT_ID = parseUuid(
  '22222222-2222-4222-8222-222222222222',
);

export const TENANT_ID = parseTenantId(
  '33333333-3333-4333-8333-333333333333',
);

export const CATEGORY_ID = parseCategoryId(
  '44444444-4444-4444-8444-444444444444',
);

export const FIXED_DATE = new Date(
  '2026-08-06T01:00:00.000Z',
);

class FixedClock implements Clock {
  constructor(
    private readonly value: Date,
  ) {}

  now(): Date {
    return new Date(
      this.value.getTime(),
    );
  }
}

class SequenceIdGenerator
implements IdGenerator {
  private currentIndex = 0;

  constructor(
    private readonly values:
      readonly Uuid[],
  ) {}

  generate(): Uuid {
    const value =
      this.values[this.currentIndex];

    if (value === undefined) {
      throw new Error(
        'No UUID configured for this generation',
      );
    }

    this.currentIndex += 1;

    return value;
  }
}

export function createProductFixture(): {
  readonly product: Product;
  readonly event: ProductCreatedEvent;
} {
  const product = Product.create(
    {
      tenantId: TENANT_ID,

      sku: ProductSku.create(
        'blusa-001',
      ),

      name: ProductName.create(
        'Blusa Canelada Feminina',
      ),

      categoryId: CATEGORY_ID,
    },
    {
      clock: new FixedClock(
        FIXED_DATE,
      ),

      idGenerator:
        new SequenceIdGenerator([
          PRODUCT_ID,
          EVENT_ID,
        ]),
        eventContext: {
  correlationId:
    CORRELATION_ID,

  causationId:
    CAUSATION_ID,
},
    },
  );

  const events =
    product.pullDomainEvents();

  const event = events[0];

  if (event === undefined) {
    throw new Error(
      'Expected ProductCreated event',
    );
  }

  return {
    product,
    event,
  };
}

export const CORRELATION_ID =
  parseUuid(
    '55555555-5555-4555-8555-555555555555',
  );

export const CAUSATION_ID =
  parseUuid(
    '66666666-6666-4666-8666-666666666666',
  );