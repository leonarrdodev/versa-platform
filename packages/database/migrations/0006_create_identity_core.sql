CREATE TABLE users (
  id UUID PRIMARY KEY,

  email TEXT NOT NULL,
  normalized_email TEXT NOT NULL,
  display_name TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'active',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT users_email_not_blank
    CHECK (BTRIM(email) <> ''),

  CONSTRAINT users_normalized_email_not_blank
    CHECK (BTRIM(normalized_email) <> ''),

  CONSTRAINT users_display_name_not_blank
    CHECK (BTRIM(display_name) <> ''),

  CONSTRAINT users_status_valid
    CHECK (
      status IN (
        'active',
        'disabled'
      )
    )
);

CREATE UNIQUE INDEX users_normalized_email_unique
  ON users (normalized_email);


CREATE TABLE tenants (
  id UUID PRIMARY KEY,

  name TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'active',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT tenants_name_not_blank
    CHECK (BTRIM(name) <> ''),

  CONSTRAINT tenants_status_valid
    CHECK (
      status IN (
        'active',
        'suspended',
        'archived'
      )
    )
);


CREATE TABLE tenant_memberships (
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,

  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT tenant_memberships_pk
    PRIMARY KEY (
      user_id,
      tenant_id
    ),

  CONSTRAINT tenant_memberships_user_fk
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE,

  CONSTRAINT tenant_memberships_tenant_fk
    FOREIGN KEY (tenant_id)
    REFERENCES tenants (id)
    ON DELETE CASCADE,

  CONSTRAINT tenant_memberships_role_valid
    CHECK (
      role IN (
        'owner',
        'admin',
        'member'
      )
    ),

  CONSTRAINT tenant_memberships_status_valid
    CHECK (
      status IN (
        'active',
        'suspended'
      )
    )
);

CREATE INDEX tenant_memberships_tenant_id_idx
  ON tenant_memberships (tenant_id);