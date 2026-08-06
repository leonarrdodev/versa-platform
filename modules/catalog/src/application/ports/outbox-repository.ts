import type {
  ProductCreatedEvent,
} from '@versa/event-contracts';

export interface OutboxRepository {
  append(
    events: readonly ProductCreatedEvent[],
  ): Promise<void>;
}