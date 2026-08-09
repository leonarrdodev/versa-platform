ALTER TABLE event_outbox
  ADD COLUMN correlation_id uuid,
  ADD COLUMN causation_id uuid;

UPDATE event_outbox
SET correlation_id = event_id
WHERE correlation_id IS NULL;

ALTER TABLE event_outbox
  ALTER COLUMN correlation_id
  SET NOT NULL;

CREATE INDEX event_outbox_correlation_idx
  ON event_outbox (
    correlation_id,
    created_at,
    event_id
  );

CREATE INDEX event_outbox_causation_idx
  ON event_outbox (
    causation_id
  )
  WHERE causation_id IS NOT NULL;