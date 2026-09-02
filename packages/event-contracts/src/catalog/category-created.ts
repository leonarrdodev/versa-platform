import type {
  DomainEventEnvelope,
} from '../domain-event.js';

export const CATEGORY_CREATED_EVENT_NAME =
  'CategoryCreated' as const;

export const CATEGORY_CREATED_EVENT_VERSION =
  1 as const;

export interface CategoryCreatedPayload {
  readonly categoryId: string;
  readonly name: string;
  readonly status: 'active';
  readonly createdAt: string;
}

export type CategoryCreatedEvent =
  DomainEventEnvelope<
    typeof CATEGORY_CREATED_EVENT_NAME,
    CategoryCreatedPayload
  >;