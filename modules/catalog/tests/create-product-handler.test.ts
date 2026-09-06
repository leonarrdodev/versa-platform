import type {
  DomainEvent,
} from '@versa/event-contracts';

import type {
  ExecutionContext,
} from '@versa/observability';

import {
  parseUuid,
} from '@versa/shared-kernel';

import type {
  Clock,
  IdGenerator,
  Uuid,
} from '@versa/shared-kernel';

import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  CreateProductHandler,
  ProductCategoryNotAvailableError,
} from '../src/index.js';

import type {
  Category,
  CategoryId,
  CategoryRepository,
  CatalogTransaction,
  CatalogUnitOfWork,
  OutboxRepository,
  Product,
  ProductRepository,
  TenantId,
} from '../src/index.js';

class FixedClock
implements Clock {
  constructor(
    private readonly fixedDate:
      Date,
  ) {}

  now():
  Date {
    return new Date(
      this.fixedDate
        .getTime(),
    );
  }
}

class SequenceIdGenerator
implements IdGenerator {
  private currentIndex =
    0;

  constructor(
    private readonly values:
      readonly Uuid[],
  ) {}

  generate():
  Uuid {
    const value =
      this.values[
        this.currentIndex
      ];

    if (
      value ===
      undefined
    ) {
      throw new Error(
        'No UUID configured for this generation',
      );
    }

    this.currentIndex +=
      1;

    return value;
  }
}

interface CategoryAvailabilityCheck {
  readonly tenantId:
    TenantId;

  readonly categoryId:
    CategoryId;
}

class InMemoryCatalogUnitOfWork
implements CatalogUnitOfWork {
  readonly committedProducts:
    Product[] = [];

  readonly committedEvents:
    DomainEvent[] = [];

  readonly categoryAvailabilityChecks:
    CategoryAvailabilityCheck[] =
      [];

  transactionsStarted =
    0;

  failWhenAppendingEvents =
    false;

  private readonly availableCategories =
    new Set<string>();

  constructor() {
    this.setCategoryAvailable(
      TENANT_ID,
      CATEGORY_ID,
      true,
    );
  }

  setCategoryAvailable(
    tenantId:
      string,

    categoryId:
      string,

    available:
      boolean,
  ): void {
    const key =
      `${tenantId}:${categoryId}`;

    if (
      available
    ) {
      this.availableCategories
        .add(
          key,
        );

      return;
    }

    this.availableCategories
      .delete(
        key,
      );
  }

  async execute<T>(
    work: (
      transaction:
        CatalogTransaction,
    ) => Promise<T>,
  ): Promise<T> {
    this.transactionsStarted +=
      1;

    const stagedProducts:
      Product[] = [];

    const stagedEvents:
      DomainEvent[] = [];

    const categoryRepository:
      CategoryRepository = {
        insert:
          async (
            _category:
              Category,
          ): Promise<void> => {
            /*
             * Não utilizado por
             * CreateProductHandler.
             */
          },

        isActiveById:
          async (
            tenantId:
              TenantId,

            categoryId:
              CategoryId,
          ): Promise<boolean> => {
            this.categoryAvailabilityChecks
              .push({
                tenantId,
                categoryId,
              });

            return this
              .availableCategories
              .has(
                `${tenantId}:${categoryId}`,
              );
          },
      };

    const productRepository:
      ProductRepository = {
        insert:
          async (
            product:
              Product,
          ): Promise<void> => {
            stagedProducts
              .push(
                product,
              );
          },
      };

    const outboxRepository:
      OutboxRepository = {
        append:
          async (
            events:
              readonly DomainEvent[],
          ): Promise<void> => {
            if (
              this
                .failWhenAppendingEvents
            ) {
              throw new Error(
                'Outbox persistence failed',
              );
            }

            stagedEvents.push(
              ...events,
            );
          },
      };

    const result =
      await work({
        categories:
          categoryRepository,

        products:
          productRepository,

        outbox:
          outboxRepository,
      });

    /*
     * Simula COMMIT.
     *
     * Se work() lançar erro,
     * nada abaixo é executado.
     */
    this.committedProducts
      .push(
        ...stagedProducts,
      );

    this.committedEvents
      .push(
        ...stagedEvents,
      );

    return result;
  }
}

const PRODUCT_ID =
  parseUuid(
    '11111111-1111-4111-8111-111111111111',
  );

const EVENT_ID =
  parseUuid(
    '22222222-2222-4222-8222-222222222222',
  );

const CORRELATION_ID =
  parseUuid(
    '55555555-5555-4555-8555-555555555555',
  );

const EXECUTION_ID =
  parseUuid(
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

const OTHER_TENANT_ID =
  '77777777-7777-4777-8777-777777777777';

const CATEGORY_ID =
  '44444444-4444-4444-8444-444444444444';

const FIXED_DATE =
  new Date(
    '2026-08-06T01:00:00.000Z',
  );

function createDependencies(): {
  readonly unitOfWork:
    InMemoryCatalogUnitOfWork;

  readonly handler:
    CreateProductHandler;
} {
  const unitOfWork =
    new InMemoryCatalogUnitOfWork();

  const handler =
    new CreateProductHandler({
      clock:
        new FixedClock(
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

describe(
  'CreateProductHandler',
  () => {
    it(
      'creates a product when the category is active in the same tenant',
      async () => {
        const {
          handler,
          unitOfWork,
        } =
          createDependencies();

        const result =
          await handler
            .execute(
              {
                tenantId:
                  TENANT_ID,

                sku:
                  '  blusa-001  ',

                name:
                  '  Blusa   Canelada  ',

                categoryId:
                  CATEGORY_ID,
              },

              EXECUTION_CONTEXT,
            );

        expect(
          result,
        ).toEqual({
          id:
            PRODUCT_ID,

          tenantId:
            TENANT_ID,

          sku:
            'BLUSA-001',

          name:
            'Blusa Canelada',

          categoryId:
            CATEGORY_ID,

          status:
            'draft',

          createdAt:
            '2026-08-06T01:00:00.000Z',

          updatedAt:
            '2026-08-06T01:00:00.000Z',
        });

        expect(
          unitOfWork
            .categoryAvailabilityChecks,
        ).toEqual([
          {
            tenantId:
              TENANT_ID,

            categoryId:
              CATEGORY_ID,
          },
        ]);
      },
    );

    it(
      'persists the product and event',
      async () => {
        const {
          handler,
          unitOfWork,
        } =
          createDependencies();

        await handler.execute(
          {
            tenantId:
              TENANT_ID,

            sku:
              'BLUSA-001',

            name:
              'Blusa Canelada',

            categoryId:
              CATEGORY_ID,
          },

          EXECUTION_CONTEXT,
        );

        expect(
          unitOfWork
            .committedProducts,
        ).toHaveLength(1);

        expect(
          unitOfWork
            .committedEvents,
        ).toHaveLength(1);

        expect(
          unitOfWork
            .committedProducts[0]
            ?.id,
        ).toBe(
          PRODUCT_ID,
        );

        expect(
          unitOfWork
            .committedEvents[0]
            ?.aggregateId,
        ).toBe(
          PRODUCT_ID,
        );
      },
    );

    it(
      'uses a single transaction for category validation, product and event',
      async () => {
        const {
          handler,
          unitOfWork,
        } =
          createDependencies();

        await handler.execute(
          {
            tenantId:
              TENANT_ID,

            sku:
              'BLUSA-001',

            name:
              'Blusa Canelada',

            categoryId:
              CATEGORY_ID,
          },

          EXECUTION_CONTEXT,
        );

        expect(
          unitOfWork
            .transactionsStarted,
        ).toBe(1);

        expect(
          unitOfWork
            .categoryAvailabilityChecks,
        ).toHaveLength(1);
      },
    );

    it(
      'rejects a category that is not available',
      async () => {
        const {
          handler,
          unitOfWork,
        } =
          createDependencies();

        unitOfWork
          .setCategoryAvailable(
            TENANT_ID,
            CATEGORY_ID,
            false,
          );

        await expect(
          handler.execute(
            {
              tenantId:
                TENANT_ID,

              sku:
                'BLUSA-001',

              name:
                'Blusa Canelada',

              categoryId:
                CATEGORY_ID,
            },

            EXECUTION_CONTEXT,
          ),
        ).rejects.toBeInstanceOf(
          ProductCategoryNotAvailableError,
        );

        expect(
          unitOfWork
            .transactionsStarted,
        ).toBe(1);

        expect(
          unitOfWork
            .committedProducts,
        ).toHaveLength(0);

        expect(
          unitOfWork
            .committedEvents,
        ).toHaveLength(0);
      },
    );

    it(
      'does not accept a category that only exists for another tenant',
      async () => {
        const {
          handler,
          unitOfWork,
        } =
          createDependencies();

        /*
         * Remove disponibilidade
         * para Tenant A e registra
         * a mesma Category no B.
         */
        unitOfWork
          .setCategoryAvailable(
            TENANT_ID,
            CATEGORY_ID,
            false,
          );

        unitOfWork
          .setCategoryAvailable(
            OTHER_TENANT_ID,
            CATEGORY_ID,
            true,
          );

        await expect(
          handler.execute(
            {
              tenantId:
                TENANT_ID,

              sku:
                'BLUSA-001',

              name:
                'Blusa Canelada',

              categoryId:
                CATEGORY_ID,
            },

            EXECUTION_CONTEXT,
          ),
        ).rejects.toBeInstanceOf(
          ProductCategoryNotAvailableError,
        );

        expect(
          unitOfWork
            .committedProducts,
        ).toHaveLength(0);

        expect(
          unitOfWork
            .committedEvents,
        ).toHaveLength(0);
      },
    );

    it(
      'does not commit the product when the outbox fails',
      async () => {
        const {
          handler,
          unitOfWork,
        } =
          createDependencies();

        unitOfWork
          .failWhenAppendingEvents =
            true;

        await expect(
          handler.execute(
            {
              tenantId:
                TENANT_ID,

              sku:
                'BLUSA-001',

              name:
                'Blusa Canelada',

              categoryId:
                CATEGORY_ID,
            },

            EXECUTION_CONTEXT,
          ),
        ).rejects.toThrow(
          'Outbox persistence failed',
        );

        expect(
          unitOfWork
            .committedProducts,
        ).toHaveLength(0);

        expect(
          unitOfWork
            .committedEvents,
        ).toHaveLength(0);
      },
    );

    it(
      'does not open a transaction when the command is invalid',
      async () => {
        const {
          handler,
          unitOfWork,
        } =
          createDependencies();

        await expect(
          handler.execute(
            {
              tenantId:
                TENANT_ID,

              sku:
                'SKU COM ESPAÇO',

              name:
                'Blusa Canelada',

              categoryId:
                CATEGORY_ID,
            },

            EXECUTION_CONTEXT,
          ),
        ).rejects.toThrow(
          'Product SKU contains invalid characters',
        );

        expect(
          unitOfWork
            .transactionsStarted,
        ).toBe(0);

        expect(
          unitOfWork
            .categoryAvailabilityChecks,
        ).toHaveLength(0);
      },
    );
  },
);