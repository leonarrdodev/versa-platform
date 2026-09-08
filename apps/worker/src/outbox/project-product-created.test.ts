import {
  PRODUCT_CREATED_EVENT_NAME,
  PRODUCT_CREATED_EVENT_VERSION,
} from '@versa/event-contracts';

import type {
  PoolClient,
} from 'pg';

import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  OutboxEventRow,
} from './outbox-event-row.js';

import {
  projectProductCreated,
} from './project-product-created.js';

const EVENT_ID =
  '11111111-1111-4111-8111-111111111111';

const TENANT_ID =
  '22222222-2222-4222-8222-222222222222';

const PRODUCT_ID =
  '33333333-3333-4333-8333-333333333333';

const CATEGORY_ID =
  '66666666-6666-4666-8666-666666666666';

interface ProductProfile {
  readonly brand?:
    string;

  readonly description?:
    string;
}

function createEvent(
  profile:
    ProductProfile = {},
): OutboxEventRow {
  return {
    eventId:
      EVENT_ID,

    tenantId:
      TENANT_ID,

    correlationId:
      '44444444-4444-4444-8444-444444444444',

    causationId:
      '55555555-5555-4555-8555-555555555555',

    aggregateType:
      'Product',

    aggregateId:
      PRODUCT_ID,

    eventName:
      PRODUCT_CREATED_EVENT_NAME,

    eventVersion:
      PRODUCT_CREATED_EVENT_VERSION,

    payload: {
      productId:
        PRODUCT_ID,

      sku:
        'BLUSA-001',

      name:
        'Blusa Canelada Feminina',

      ...profile,

      categoryId:
        CATEGORY_ID,

      createdAt:
        '2026-08-09T03:00:00.000Z',
    },

    occurredAt:
      new Date(
        '2026-08-09T03:00:00.000Z',
      ),

    processingAttempts:
      0,
  };
}

function createClient(): {
  readonly client:
    PoolClient;

  readonly query:
    ReturnType<
      typeof vi.fn
    >;
} {
  const query =
    vi.fn(
      async (
        _sql:
          string,

        _values?:
          readonly unknown[],
      ) => ({
        rows:
          [],

        rowCount:
          1,
      }),
    );

  return {
    query,

    client: {
      query,
    } as unknown as
      PoolClient,
  };
}

describe(
  'projectProductCreated',
  () => {
    it(
      'projects an old ProductCreated v1 without profile fields',
      async () => {
        const {
          client,
          query,
        } =
          createClient();

        await projectProductCreated(
          client,
          createEvent(),
        );

        expect(
          query,
        ).toHaveBeenCalledOnce();

        const call =
          query.mock.calls[0];

        if (
          call ===
          undefined
        ) {
          throw new Error(
            'Expected projection query',
          );
        }

        const [
          sql,
          values,
        ] =
          call;

        expect(
          sql,
        ).toContain(
          'INSERT INTO product_read_model',
        );

        expect(
          sql,
        ).toContain(
          'ON CONFLICT',
        );

        expect(
          values,
        ).toEqual([
          PRODUCT_ID,
          TENANT_ID,
          'BLUSA-001',
          'Blusa Canelada Feminina',
          null,
          null,
          CATEGORY_ID,
          '2026-08-09T03:00:00.000Z',
          EVENT_ID,
        ]);
      },
    );

    it(
      'projects ProductCreated profile fields when present',
      async () => {
        const {
          client,
          query,
        } =
          createClient();

        await projectProductCreated(
          client,
          createEvent({
            brand:
              'Versa',

            description:
              'Blusa feminina canelada.',
          }),
        );

        const call =
          query.mock.calls[0];

        if (
          call ===
          undefined
        ) {
          throw new Error(
            'Expected projection query',
          );
        }

        const [
          ,
          values,
        ] =
          call;

        expect(
          values,
        ).toEqual([
          PRODUCT_ID,
          TENANT_ID,
          'BLUSA-001',
          'Blusa Canelada Feminina',
          'Versa',
          'Blusa feminina canelada.',
          CATEGORY_ID,
          '2026-08-09T03:00:00.000Z',
          EVENT_ID,
        ]);
      },
    );

    it(
      'uses the source event as the idempotency key',
      async () => {
        const {
          client,
          query,
        } =
          createClient();

        await projectProductCreated(
          client,
          createEvent(),
        );

        const call =
          query.mock.calls[0];

        if (
          call ===
          undefined
        ) {
          throw new Error(
            'Expected projection query',
          );
        }

        const [
          sql,
        ] =
          call;

        expect(
          sql,
        ).toContain(
          'source_event_id',
        );

        expect(
          sql,
        ).toContain(
          'DO NOTHING',
        );
      },
    );

    it(
      'rejects an unsupported event version',
      async () => {
        const {
          client,
          query,
        } =
          createClient();

        const event = {
          ...createEvent(),

          eventVersion:
            99,
        };

        await expect(
          projectProductCreated(
            client,
            event,
          ),
        ).rejects.toThrow(
          'Versão ProductCreated não suportada',
        );

        expect(
          query,
        ).not
          .toHaveBeenCalled();
      },
    );
  },
);