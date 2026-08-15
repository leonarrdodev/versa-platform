ALTER TABLE event_outbox
  ADD COLUMN next_attempt_at timestamptz,
  ADD COLUMN dead_lettered_at timestamptz;

UPDATE event_outbox
SET next_attempt_at = created_at
WHERE processed_at IS NULL;

ALTER TABLE event_outbox
  ALTER COLUMN next_attempt_at
  SET DEFAULT now();

ALTER TABLE event_outbox
  ADD CONSTRAINT event_outbox_processing_state_valid
  CHECK (
    (
      processed_at IS NULL
      AND dead_lettered_at IS NULL
      AND next_attempt_at IS NOT NULL
    )
    OR
    (
      processed_at IS NOT NULL
      AND dead_lettered_at IS NULL
      AND next_attempt_at IS NULL
    )
    OR
    (
      processed_at IS NULL
      AND dead_lettered_at IS NOT NULL
      AND next_attempt_at IS NULL
    )
  );

DROP INDEX IF EXISTS event_outbox_pending_idx;

CREATE INDEX event_outbox_ready_idx
  ON event_outbox (
    next_attempt_at,
    created_at,
    event_id
  )
  WHERE
    processed_at IS NULL
    AND dead_lettered_at IS NULL;

CREATE INDEX event_outbox_dead_letter_idx
  ON event_outbox (
    dead_lettered_at,
    event_id
  )
  WHERE dead_lettered_at IS NOT NULL;