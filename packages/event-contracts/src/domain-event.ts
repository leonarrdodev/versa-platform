export interface DomainEventEnvelope<
  TName extends string,
  TPayload,
> {
  readonly eventId: string;
  readonly eventName: TName;
  readonly eventVersion: number;

  readonly tenantId: string;

  readonly aggregateType: string;
  readonly aggregateId: string;

  readonly occurredAt: string;
  readonly payload: Readonly<TPayload>;
}