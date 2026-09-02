export {
  PRODUCT_CREATED_EVENT_NAME,
  PRODUCT_CREATED_EVENT_VERSION,
} from './catalog/product-created.js';

export type {
  ProductCreatedEvent,
  ProductCreatedPayload,
} from './catalog/product-created.js';

export {
  CATEGORY_CREATED_EVENT_NAME,
  CATEGORY_CREATED_EVENT_VERSION,
} from './catalog/category-created.js';

export type {
  CategoryCreatedEvent,
  CategoryCreatedPayload,
} from './catalog/category-created.js';

export type {
  DomainEvent,
  DomainEventEnvelope,
  DomainEventTraceContext,
} from './domain-event.js';