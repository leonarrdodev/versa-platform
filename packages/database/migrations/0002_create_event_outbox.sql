CREATE TABLE event_outbox (
  event_id uuid PRIMARY KEY,

  tenant_id uuid NOT NULL,

  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,

  event_name text NOT NULL,
  event_version integer NOT NULL,

  payload jsonb NOT NULL,

  occurred_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),

  processed_at timestamptz,

  processing_attempts integer NOT NULL DEFAULT 0,
  last_error text,

  CONSTRAINT event_outbox_aggregate_type_not_empty
    CHECK (btrim(aggregate_type) <> ''),

  CONSTRAINT event_outbox_event_name_not_empty
    CHECK (btrim(event_name) <> ''),

  CONSTRAINT event_outbox_event_version_positive
    CHECK (event_version > 0),

  CONSTRAINT event_outbox_payload_object
    CHECK (jsonb_typeof(payload) = 'object'),

  CONSTRAINT event_outbox_processing_attempts_valid
    CHECK (processing_attempts >= 0)
);

CREATE INDEX event_outbox_pending_idx
  ON event_outbox (created_at, event_id)
  WHERE processed_at IS NULL;

CREATE INDEX event_outbox_tenant_aggregate_idx
  ON event_outbox (
    tenant_id,
    aggregate_type,
    aggregate_id
  );