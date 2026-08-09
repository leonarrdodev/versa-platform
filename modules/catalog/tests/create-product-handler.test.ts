import {
  describe,
  expect,
  it,
} from 'vitest';

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
  CreateProductHandler,
} from '../src/index.js';

import type {
  CatalogTransaction,
  CatalogUnitOfWork,
  OutboxRepository,
  Product,
  ProductRepository,
} from '../src/index.js';

import type {
  ExecutionContext,
} from '@versa/observability';

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

class InMemoryCatalogUnitOfWork
implements CatalogUnitOfWork {
  readonly committedProducts: Product[] = [];

  readonly committedEvents:
    ProductCreatedEvent[] = [];

  transactionsStarted = 0;

  failWhenAppendingEvents = false;

  async execute<T>(
    work: (
      transaction: CatalogTransaction,
    ) => Promise<T>,
  ): Promise<T> {
    this.transactionsStarted += 1;

    const stagedProducts: Product[] = [];

    const stagedEvents:
      ProductCreatedEvent[] = [];

    const productRepository:
      ProductRepository = {
        insert: async (
          product: Product,
        ): Promise<void> => {
          stagedProducts.push(product);
        },
      };

    const outboxRepository:
      OutboxRepository = {
        append: async (
          events:
            readonly ProductCreatedEvent[],
        ): Promise<void> => {
          if (
            this.failWhenAppendingEvents
          ) {
            throw new Error(
              'Outbox persistence failed',
            );
          }

          stagedEvents.push(...events);
        },
      };

    const result = await work({
      products: productRepository,
      outbox: outboxRepository,
    });

    this.committedProducts.push(
      ...stagedProducts,
    );

    this.committedEvents.push(
      ...stagedEvents,
    );

    return result;
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

const EXECUTION_ID = parseUuid(
  '66666666-6666-4666-8666-666666666666',
);

const EXECUTION_CONTEXT = {
  correlationId:
    CORRELATION_ID,

  executionId:
    EXECUTION_ID,
} satisfies ExecutionContext;

const TENANT_ID =
  '33333333-3333-4333-8333-333333333333';

const CATEGORY_ID =
  '44444444-4444-4444-8444-444444444444';

const FIXED_DATE = new Date(
  '2026-08-06T01:00:00.000Z',
);

function createDependencies(): {
  readonly unitOfWork:
    InMemoryCatalogUnitOfWork;
  readonly handler: CreateProductHandler;
} {
  const unitOfWork =
    new InMemoryCatalogUnitOfWork();

  const handler =
    new CreateProductHandler({
      clock: new FixedClock(
        FIXED_DATE,
      ),
      idGenerator:
        new SequenceIdGenerator([
          PRODUCT_ID,
          EVENT_ID,
        ]),
      unitOfWork,
    });

  return {
    unitOfWork,
    handler,
  };
}

describe('CreateProductHandler', () => {
  it('creates a product and returns its result', async () => {
    const {
      handler,
    } = createDependencies();

    const result = await handler.execute({
      tenantId: TENANT_ID,
      sku: '  blusa-001  ',
      name: '  Blusa   Canelada  ',
      categoryId: CATEGORY_ID,
    },
  EXECUTION_CONTEXT,);

    expect(result).toEqual({
      id: PRODUCT_ID,
      tenantId: TENANT_ID,
      sku: 'BLUSA-001',
      name: 'Blusa Canelada',
      categoryId: CATEGORY_ID,
      status: 'draft',
      createdAt:
        '2026-08-06T01:00:00.000Z',
      updatedAt:
        '2026-08-06T01:00:00.000Z',
    });
  });

  it('persists the product and event', async () => {
    const {
      handler,
      unitOfWork,
    } = createDependencies();

    await handler.execute({
      tenantId: TENANT_ID,
      sku: 'BLUSA-001',
      name: 'Blusa Canelada',
      categoryId: CATEGORY_ID,
    },
  EXECUTION_CONTEXT,);

    expect(
      unitOfWork.committedProducts,
    ).toHaveLength(1);

    expect(
      unitOfWork.committedEvents,
    ).toHaveLength(1);

    expect(
      unitOfWork.committedProducts[0]?.id,
    ).toBe(PRODUCT_ID);

    expect(
      unitOfWork.committedEvents[0]
        ?.aggregateId,
    ).toBe(PRODUCT_ID);
  });

  it('uses a single transaction', async () => {
    const {
      handler,
      unitOfWork,
    } = createDependencies();

    await handler.execute({
      tenantId: TENANT_ID,
      sku: 'BLUSA-001',
      name: 'Blusa Canelada',
      categoryId: CATEGORY_ID,
    },
  EXECUTION_CONTEXT,);

    expect(
      unitOfWork.transactionsStarted,
    ).toBe(1);
  });

  it('does not commit the product when the outbox fails', async () => {
    const {
      handler,
      unitOfWork,
    } = createDependencies();

    unitOfWork.failWhenAppendingEvents =
      true;

    await expect(
      handler.execute({
        tenantId: TENANT_ID,
        sku: 'BLUSA-001',
        name: 'Blusa Canelada',
        categoryId: CATEGORY_ID,
      },
  EXECUTION_CONTEXT,),
    ).rejects.toThrow(
      'Outbox persistence failed',
    );

    expect(
      unitOfWork.committedProducts,
    ).toHaveLength(0);

    expect(
      unitOfWork.committedEvents,
    ).toHaveLength(0);
  });

  it('does not open a transaction when the command is invalid', async () => {
    const {
      handler,
      unitOfWork,
    } = createDependencies();

    await expect(
      handler.execute({
        tenantId: TENANT_ID,
        sku: 'SKU COM ESPAÇO',
        name: 'Blusa Canelada',
        categoryId: CATEGORY_ID,
      },
  EXECUTION_CONTEXT,),
    ).rejects.toThrow(
      'Product SKU contains invalid characters',
    );

    expect(
      unitOfWork.transactionsStarted,
    ).toBe(0);
  });
});