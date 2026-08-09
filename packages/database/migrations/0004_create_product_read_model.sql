CREATE TABLE product_read_model (
  id uuid PRIMARY KEY,

  tenant_id uuid NOT NULL,

  sku text NOT NULL,
  name text NOT NULL,
  category_id uuid NOT NULL,

  status text NOT NULL,

  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,

  source_event_id uuid NOT NULL UNIQUE,

  projected_at timestamptz NOT NULL
    DEFAULT now(),

  CONSTRAINT product_read_model_sku_not_blank
    CHECK (btrim(sku) <> ''),

  CONSTRAINT product_read_model_name_not_blank
    CHECK (btrim(name) <> ''),

  CONSTRAINT product_read_model_status_valid
    CHECK (
      status IN (
        'draft',
        'active',
        'inactive',
        'archived'
      )
    ),

  CONSTRAINT product_read_model_tenant_sku_unique
    UNIQUE (
      tenant_id,
      sku
    )
);

CREATE INDEX product_read_model_tenant_idx
  ON product_read_model (
    tenant_id
  );

CREATE INDEX product_read_model_tenant_status_idx
  ON product_read_model (
    tenant_id,
    status
  );