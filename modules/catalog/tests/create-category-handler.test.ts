import {
  CATEGORY_CREATED_EVENT_NAME,
  CATEGORY_CREATED_EVENT_VERSION,
} from '@versa/event-contracts';

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
  CreateCategoryHandler,
} from '../src/index.js';

import type {
  CatalogTransaction,
  CatalogUnitOfWork,
  Category,
  CategoryRepository,
  OutboxRepository,
  ProductRepository,
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

class SequenceIdGenerator
implements IdGenerator {
  private currentIndex = 0;

  constructor(
    private readonly values:
      readonly Uuid[],
  ) {}

  generate(): Uuid {
    const value =
      this.values[
        this.currentIndex
      ];

    if (
      value === undefined
    ) {
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
  readonly committedCategories:
    Category[] = [];

  readonly committedEvents:
    DomainEvent[] = [];

  transactionsStarted = 0;

  failWhenAppendingEvents =
    false;

  async execute<T>(
    work: (
      transaction:
        CatalogTransaction,
    ) => Promise<T>,
  ): Promise<T> {
    this.transactionsStarted += 1;

    const stagedCategories:
      Category[] = [];

    const stagedEvents:
      DomainEvent[] = [];

    const categoryRepository:
      CategoryRepository = {
        insert: async (
          category: Category,
        ): Promise<void> => {
          stagedCategories.push(
            category,
          );
        },
      };

    /*
     * CreateCategory não utiliza
     * Products, mas CatalogTransaction
     * representa a transação completa
     * do bounded context.
     */
    const productRepository:
      ProductRepository = {
        insert: async () => {},
      };

    const outboxRepository:
      OutboxRepository = {
        append: async (
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

    this.committedCategories.push(
      ...stagedCategories,
    );

    this.committedEvents.push(
      ...stagedEvents,
    );

    return result;
  }
}

const CATEGORY_ID =
  parseUuid(
    '11111111-1111-4111-8111-111111111111',
  );

const EVENT_ID =
  parseUuid(
    '22222222-2222-4222-8222-222222222222',
  );

const TENANT_ID =
  '33333333-3333-4333-8333-333333333333';

const CORRELATION_ID =
  parseUuid(
    '55555555-5555-4555-8555-555555555555',
  );

const EXECUTION_ID =
  parseUuid(
    '66666666-6666-4666-8666-666666666666',
  );

const FIXED_DATE =
  new Date(
    '2026-08-30T01:00:00.000Z',
  );

const EXECUTION_CONTEXT = {
  correlationId:
    CORRELATION_ID,

  executionId:
    EXECUTION_ID,
} satisfies ExecutionContext;

function createDependencies(): {
  readonly unitOfWork:
    InMemoryCatalogUnitOfWork;

  readonly handler:
    CreateCategoryHandler;
} {
  const unitOfWork =
    new InMemoryCatalogUnitOfWork();

  const handler =
    new CreateCategoryHandler({
      clock:
        new FixedClock(
          FIXED_DATE,
        ),

      idGenerator:
        new SequenceIdGenerator([
          CATEGORY_ID,
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
  'CreateCategoryHandler',
  () => {
    it(
      'creates a category and returns its result',
      async () => {
        const {
          handler,
        } =
          createDependencies();

        const result =
          await handler.execute(
            {
              tenantId:
                TENANT_ID,

              name:
                '  Blusas   Femininas  ',
            },

            EXECUTION_CONTEXT,
          );

        expect(
          result,
        ).toEqual({
          id:
            CATEGORY_ID,

          tenantId:
            TENANT_ID,

          name:
            'Blusas Femininas',

          status:
            'active',

          createdAt:
            '2026-08-30T01:00:00.000Z',

          updatedAt:
            '2026-08-30T01:00:00.000Z',
        });
      },
    );

    it(
      'persists the category and its domain event',
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

            name:
              'Blusas',
          },

          EXECUTION_CONTEXT,
        );

        expect(
          unitOfWork
            .committedCategories,
        ).toHaveLength(1);

        expect(
          unitOfWork
            .committedEvents,
        ).toHaveLength(1);

        expect(
          unitOfWork
            .committedCategories[0]
            ?.id,
        ).toBe(
          CATEGORY_ID,
        );

        const event =
          unitOfWork
            .committedEvents[0];

        expect(
          event,
        ).toBeDefined();

        expect(
          event?.eventName,
        ).toBe(
          CATEGORY_CREATED_EVENT_NAME,
        );

        expect(
          event?.eventVersion,
        ).toBe(
          CATEGORY_CREATED_EVENT_VERSION,
        );

        expect(
          event?.tenantId,
        ).toBe(
          TENANT_ID,
        );

        expect(
          event?.aggregateType,
        ).toBe(
          'Category',
        );

        expect(
          event?.aggregateId,
        ).toBe(
          CATEGORY_ID,
        );

        expect(
          event?.correlationId,
        ).toBe(
          CORRELATION_ID,
        );

        expect(
          event?.causationId,
        ).toBe(
          EXECUTION_ID,
        );

        expect(
          event?.occurredAt,
        ).toBe(
          '2026-08-30T01:00:00.000Z',
        );

        expect(
          event?.payload,
        ).toEqual({
          categoryId:
            CATEGORY_ID,

          name:
            'Blusas',

          status:
            'active',

          createdAt:
            '2026-08-30T01:00:00.000Z',
        });
      },
    );

    it(
      'uses a single transaction',
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

            name:
              'Blusas',
          },

          EXECUTION_CONTEXT,
        );

        expect(
          unitOfWork
            .transactionsStarted,
        ).toBe(1);
      },
    );

    it(
      'does not commit the category when the outbox fails',
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

              name:
                'Blusas',
            },

            EXECUTION_CONTEXT,
          ),
        ).rejects.toThrow(
          'Outbox persistence failed',
        );

        expect(
          unitOfWork
            .committedCategories,
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

              name:
                '     ',
            },

            EXECUTION_CONTEXT,
          ),
        ).rejects.toThrow(
          'Category name cannot be empty',
        );

        expect(
          unitOfWork
            .transactionsStarted,
        ).toBe(0);
      },
    );
  },
);