import {
  PRODUCT_CREATED_EVENT_VERSION,
} from '@versa/event-contracts';

import type {
  ProductCreatedPayload,
} from '@versa/event-contracts';

import type {
  PoolClient,
} from 'pg';

import type {
  OutboxEventRow,
} from './outbox-event-row.js';

function parsePayload(
  payload:
    unknown,
): ProductCreatedPayload {
  if (
    typeof payload !==
      'object'
    ||
    payload ===
      null
  ) {
    throw new Error(
      'ProductCreated payload inválido',
    );
  }

  const candidate =
    payload as Record<
      string,
      unknown
    >;

  const {
    productId,
    sku,
    name,
    brand,
    description,
    categoryId,
    createdAt,
  } =
    candidate;

  if (
    typeof productId !==
      'string'
    ||
    typeof sku !==
      'string'
    ||
    typeof name !==
      'string'
    ||
    typeof categoryId !==
      'string'
    ||
    typeof createdAt !==
      'string'
  ) {
    throw new Error(
      'ProductCreated payload incompleto',
    );
  }

  if (
    brand !==
      undefined
    &&
    typeof brand !==
      'string'
  ) {
    throw new Error(
      'ProductCreated brand inválida',
    );
  }

  if (
    description !==
      undefined
    &&
    typeof description !==
      'string'
  ) {
    throw new Error(
      'ProductCreated description inválida',
    );
  }

  return {
    productId,
    sku,
    name,

    ...(brand ===
    undefined
      ? {}
      : {
          brand,
        }),

    ...(description ===
    undefined
      ? {}
      : {
          description,
        }),

    categoryId,
    createdAt,
  };
}

export async function projectProductCreated(
  client:
    PoolClient,

  event:
    OutboxEventRow,
): Promise<void> {
  if (
    event.eventVersion !==
      PRODUCT_CREATED_EVENT_VERSION
  ) {
    throw new Error(
      `Versão ProductCreated não suportada: ${event.eventVersion}`,
    );
  }

  const payload =
    parsePayload(
      event.payload,
    );

  await client.query(
    `
      INSERT INTO product_read_model (
        id,
        tenant_id,
        sku,
        name,
        brand,
        description,
        category_id,
        status,
        created_at,
        updated_at,
        source_event_id
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        'draft',
        $8,
        $8,
        $9
      )
      ON CONFLICT (
        source_event_id
      )
      DO NOTHING
    `,
    [
      payload.productId,
      event.tenantId,
      payload.sku,
      payload.name,

      payload.brand ??
        null,

      payload.description ??
        null,

      payload.categoryId,
      payload.createdAt,
      event.eventId,
    ],
  );
}