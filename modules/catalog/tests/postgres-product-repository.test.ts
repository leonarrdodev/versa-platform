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
  PostgresProductRepository,
} from '../src/index.js';

import {
  CATEGORY_ID,
  FIXED_DATE,
  PRODUCT_ID,
  TENANT_ID,
  createProductFixture,
} from './helpers/create-product-fixture.js';

describe('PostgresProductRepository', () => {
  it('inserts the product into PostgreSQL', async () => {
    const query = vi
      .fn()
      .mockResolvedValue({
        rows: [],
        rowCount: 1,
      });

    const client = {
      query,
    } as unknown as PoolClient;

    const repository =
      new PostgresProductRepository(
        client,
      );

    const {
      product,
    } = createProductFixture();

    await repository.insert(product);

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
      'INSERT INTO products',
    );

    expect(values).toEqual([
      PRODUCT_ID,
      TENANT_ID,
      'BLUSA-001',
      'Blusa Canelada Feminina',
      CATEGORY_ID,
      'draft',
      FIXED_DATE,
      FIXED_DATE,
    ]);
  });
});