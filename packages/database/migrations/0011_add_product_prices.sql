ALTER TABLE products
  ADD COLUMN cost_price_cents bigint,
  ADD COLUMN sale_price_cents bigint;

ALTER TABLE product_read_model
  ADD COLUMN cost_price_cents bigint,
  ADD COLUMN sale_price_cents bigint;

ALTER TABLE products
  ADD CONSTRAINT products_cost_price_cents_valid
    CHECK (
      cost_price_cents IS NULL
      OR cost_price_cents >= 0
    ),

  ADD CONSTRAINT products_sale_price_cents_valid
    CHECK (
      sale_price_cents IS NULL
      OR sale_price_cents >= 0
    );

ALTER TABLE product_read_model
  ADD CONSTRAINT product_read_model_cost_price_cents_valid
    CHECK (
      cost_price_cents IS NULL
      OR cost_price_cents >= 0
    ),

  ADD CONSTRAINT product_read_model_sale_price_cents_valid
    CHECK (
      sale_price_cents IS NULL
      OR sale_price_cents >= 0
    );