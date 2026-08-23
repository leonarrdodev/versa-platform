CREATE TABLE password_credentials (
  user_id UUID PRIMARY KEY,

  password_hash TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT password_credentials_user_fk
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE,

  CONSTRAINT password_credentials_hash_not_blank
    CHECK (
      BTRIM(password_hash) <> ''
    )
);