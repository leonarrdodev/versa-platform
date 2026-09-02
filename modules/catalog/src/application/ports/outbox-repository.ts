import type {
  DomainEvent,
} from '@versa/event-contracts';

export interface OutboxRepository {
  append(
    events: readonly DomainEvent[],
  ): Promise<void>;
}