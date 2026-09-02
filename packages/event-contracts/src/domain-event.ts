export interface DomainEventTraceContext {
  readonly correlationId: string;
  readonly causationId: string | null;
}

export interface DomainEventEnvelope<
  TName extends string,
  TPayload,
> extends DomainEventTraceContext {
  readonly eventId: string;
  readonly eventName: TName;
  readonly eventVersion: number;

  readonly tenantId: string;

  readonly aggregateType: string;
  readonly aggregateId: string;

  readonly occurredAt: string;
  readonly payload: Readonly<TPayload>;
}

export type DomainEvent =
  DomainEventEnvelope<
    string,
    unknown
  >;