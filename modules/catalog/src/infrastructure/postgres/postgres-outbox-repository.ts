import type {
  PoolClient,
} from 'pg';

import type {
  ProductCreatedEvent,
} from '@versa/event-contracts';

import type {
  OutboxRepository,
} from '../../application/ports/outbox-repository.js';

export class PostgresOutboxRepository
implements OutboxRepository {
  constructor(
    private readonly client: PoolClient,
  ) {}

  async append(
    events:
      readonly ProductCreatedEvent[],
  ): Promise<void> {
    for (const event of events) {
      await this.client.query(
        `
          INSERT INTO event_outbox (
            event_id,
            tenant_id,
            correlation_id,
            causation_id,
            aggregate_type,
            aggregate_id,
            event_name,
            event_version,
            payload,
            occurred_at
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9::jsonb,
            $10
          )
        `,
        [
          event.eventId,
          event.tenantId,
          event.correlationId,
          event.causationId,
          event.aggregateType,
          event.aggregateId,
          event.eventName,
          event.eventVersion,
          JSON.stringify(
            event.payload,
          ),
          event.occurredAt,
        ],
      );
    }
  }
}