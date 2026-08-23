CREATE TABLE sessions (
  id UUID PRIMARY KEY,

  user_id UUID NOT NULL,

  active_tenant_id UUID,

  token_hash TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL,

  revoked_at TIMESTAMPTZ,

  CONSTRAINT sessions_user_fk
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE,

  CONSTRAINT sessions_active_tenant_fk
    FOREIGN KEY (active_tenant_id)
    REFERENCES tenants (id)
    ON DELETE SET NULL,

  CONSTRAINT sessions_token_hash_not_blank
    CHECK (
      BTRIM(token_hash) <> ''
    ),

  CONSTRAINT sessions_expiration_valid
    CHECK (
      expires_at > created_at
    ),

  CONSTRAINT sessions_last_seen_valid
    CHECK (
      last_seen_at >= created_at
    ),

  CONSTRAINT sessions_revoked_at_valid
    CHECK (
      revoked_at IS NULL
      OR revoked_at >= created_at
    )
);

CREATE UNIQUE INDEX sessions_token_hash_unique
  ON sessions (token_hash);

CREATE INDEX sessions_user_id_idx
  ON sessions (
    user_id,
    created_at DESC
  );

CREATE INDEX sessions_expiration_idx
  ON sessions (expires_at)
  WHERE revoked_at IS NULL;