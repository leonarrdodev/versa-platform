CREATE TABLE products (
  id uuid PRIMARY KEY,

  tenant_id uuid NOT NULL,

  sku text NOT NULL,
  name text NOT NULL,
  category_id uuid NOT NULL,

  status text NOT NULL DEFAULT 'draft',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT products_sku_not_empty
    CHECK (btrim(sku) <> ''),

  CONSTRAINT products_name_not_empty
    CHECK (btrim(name) <> ''),

  CONSTRAINT products_status_valid
    CHECK (
      status IN (
        'draft',
        'active',
        'inactive',
        'archived'
      )
    ),

  CONSTRAINT products_tenant_sku_unique
    UNIQUE (tenant_id, sku)
);

CREATE INDEX products_tenant_id_idx
  ON products (tenant_id);

CREATE INDEX products_tenant_status_idx
  ON products (tenant_id, status);