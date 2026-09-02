CREATE TABLE categories (
  id uuid PRIMARY KEY,

  tenant_id uuid NOT NULL,

  name text NOT NULL,
  normalized_name text NOT NULL,

  status text NOT NULL DEFAULT 'active',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT categories_name_not_blank
    CHECK (
      btrim(name) <> ''
    ),

  CONSTRAINT categories_normalized_name_not_blank
    CHECK (
      btrim(normalized_name) <> ''
    ),

  CONSTRAINT categories_status_valid
    CHECK (
      status IN (
        'active',
        'archived'
      )
    ),

  CONSTRAINT categories_tenant_name_unique
    UNIQUE (
      tenant_id,
      normalized_name
    ),

  CONSTRAINT categories_tenant_id_id_unique
    UNIQUE (
      tenant_id,
      id
    )
);

CREATE INDEX categories_tenant_status_name_idx
  ON categories (
    tenant_id,
    status,
    name
  );

ALTER TABLE products
  ADD CONSTRAINT products_tenant_category_fk
  FOREIGN KEY (
    tenant_id,
    category_id
  )
  REFERENCES categories (
    tenant_id,
    id
  )
  ON DELETE RESTRICT;