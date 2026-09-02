import {
  CATEGORY_CREATED_EVENT_VERSION,
} from '@versa/event-contracts';

import type {
  OutboxEventRow,
} from './outbox-event-row.js';

export function acknowledgeCategoryCreated(
  event: OutboxEventRow,
): void {
  if (
    event.eventVersion !==
    CATEGORY_CREATED_EVENT_VERSION
  ) {
    throw new Error(
      `Versão CategoryCreated não suportada: ${event.eventVersion}`,
    );
  }
}