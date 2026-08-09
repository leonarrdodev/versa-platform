export interface OutboxEventRow {
  readonly eventId: string;
  readonly tenantId: string;

  readonly correlationId: string;
  readonly causationId:
    string | null;

  readonly aggregateType: string;
  readonly aggregateId: string;

  readonly eventName: string;
  readonly eventVersion: number;

  readonly payload: unknown;

  readonly occurredAt: Date;

  readonly processingAttempts:
    number;
}