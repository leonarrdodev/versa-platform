import type {
  PoolClient,
} from 'pg';

import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  PostgresOutboxRepository,
} from '../src/index.js';

import {
  CAUSATION_ID,
  CATEGORY_ID,
  CORRELATION_ID,
  EVENT_ID,
  PRODUCT_ID,
  TENANT_ID,
  createProductFixture,
} from './helpers/create-product-fixture.js';

describe('PostgresOutboxRepository', () => {
  it('inserts a domain event into the outbox', async () => {
    const query = vi.fn(
      async (
        _sql: string,
        _values: readonly unknown[],
      ) => {
        return {
          rows: [],
          rowCount: 1,
        };
      },
    );

    const client = {
      query,
    } as unknown as PoolClient;

    const repository =
      new PostgresOutboxRepository(
        client,
      );

    const {
      event,
    } = createProductFixture();

    await repository.append([
      event,
    ]);

    expect(query).toHaveBeenCalledOnce();

    const call = query.mock.calls[0];

    if (call === undefined) {
      throw new Error(
        'Expected PostgreSQL query',
      );
    }

    const [
      sql,
      values,
    ] = call;

    expect(sql).toContain(
      'INSERT INTO event_outbox',
    );

    expect(values).toEqual([
      EVENT_ID,
      TENANT_ID,
      CORRELATION_ID,
      CAUSATION_ID,
      'Product',
      PRODUCT_ID,
      'ProductCreated',
      1,
      JSON.stringify({
        productId:
          PRODUCT_ID,

        sku:
          'BLUSA-001',

        name:
          'Blusa Canelada Feminina',

        categoryId:
          CATEGORY_ID,

        createdAt:
          '2026-08-06T01:00:00.000Z',
      }),

      '2026-08-06T01:00:00.000Z',
    ]);
  });
});