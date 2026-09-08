import type {
  DomainEventEnvelope,
} from '../domain-event.js';

export const PRODUCT_CREATED_EVENT_NAME =
  'ProductCreated' as const;

export const PRODUCT_CREATED_EVENT_VERSION =
  1 as const;

export interface ProductCreatedPayload {
  readonly productId:
    string;

  readonly sku:
    string;

  readonly name:
    string;

  readonly brand?:
    string;

  readonly description?:
    string;

  readonly categoryId:
    string;

  readonly createdAt:
    string;
}

export type ProductCreatedEvent =
  DomainEventEnvelope<
    typeof PRODUCT_CREATED_EVENT_NAME,
    ProductCreatedPayload
  >;