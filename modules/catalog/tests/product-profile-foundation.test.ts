import {
  PRODUCT_CREATED_EVENT_NAME,
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
  describe,
  expect,
  it,
} from 'vitest';

import {
  parseCategoryId,
  parseTenantId,
  Product,
  ProductBrand,
  ProductDescription,
  ProductName,
  ProductSku,
} from '../src/index.js';

class FixedClock
implements Clock {
  now():
  Date {
    return new Date(
      '2026-09-06T20:00:00.000Z',
    );
  }
}

class SequenceIdGenerator
implements IdGenerator {
  private index =
    0;

  constructor(
    private readonly ids:
      readonly Uuid[],
  ) {}

  generate():
  Uuid {
    const id =
      this.ids[
        this.index
      ];

    if (
      id ===
      undefined
    ) {
      throw new Error(
        'No UUID configured',
      );
    }

    this.index +=
      1;

    return id;
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

const TENANT_ID =
  parseTenantId(
    '33333333-3333-4333-8333-333333333333',
  );

const CATEGORY_ID =
  parseCategoryId(
    '44444444-4444-4444-8444-444444444444',
  );

const CORRELATION_ID =
  parseUuid(
    '55555555-5555-4555-8555-555555555555',
  );

const CAUSATION_ID =
  parseUuid(
    '66666666-6666-4666-8666-666666666666',
  );

describe(
  'Product profile foundation',
  () => {
    it(
      'normalizes optional profile values',
      () => {
        expect(
          ProductBrand
            .create(
              '  Versa   Wear  ',
            )
            ?.value,
        ).toBe(
          'Versa Wear',
        );

        expect(
          ProductDescription
            .create(
              '  Linha 1\r\nLinha 2  ',
            )
            ?.value,
        ).toBe(
          'Linha 1\nLinha 2',
        );
      },
    );

    it(
      'treats blank optional values as absent',
      () => {
        expect(
          ProductBrand.create(
            '   ',
          ),
        ).toBeNull();

        expect(
          ProductDescription.create(
            '\n\t ',
          ),
        ).toBeNull();
      },
    );

    it(
      'rejects oversized profile values',
      () => {
        expect(
          () =>
            ProductBrand.create(
              'A'.repeat(
                121,
              ),
            ),
        ).toThrow();

        expect(
          () =>
            ProductDescription.create(
              'A'.repeat(
                2001,
              ),
            ),
        ).toThrow();
      },
    );

    it(
      'stores profile data and records it in ProductCreated',
      () => {
        const brand =
          ProductBrand.create(
            '  Versa   Wear ',
          );

        const description =
          ProductDescription.create(
            '  Blusa feminina canelada.  ',
          );

        const product =
          Product.create(
            {
              tenantId:
                TENANT_ID,

              sku:
                ProductSku.create(
                  'blusa-001',
                ),

              name:
                ProductName.create(
                  'Blusa Canelada',
                ),

              categoryId:
                CATEGORY_ID,

              brand,

              description,
            },
            {
              clock:
                new FixedClock(),

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

        expect(
          product.brand
            ?.value,
        ).toBe(
          'Versa Wear',
        );

        expect(
          product.description
            ?.value,
        ).toBe(
          'Blusa feminina canelada.',
        );

        const event =
          product
            .pullDomainEvents()[0];

        expect(
          event?.eventName,
        ).toBe(
          PRODUCT_CREATED_EVENT_NAME,
        );

        expect(
          event?.payload,
        ).toEqual({
          productId:
            PRODUCT_ID,

          sku:
            'BLUSA-001',

          name:
            'Blusa Canelada',

          brand:
            'Versa Wear',

          description:
            'Blusa feminina canelada.',

          categoryId:
            CATEGORY_ID,

          createdAt:
            '2026-09-06T20:00:00.000Z',
        });
      },
    );
  },
);