ALTER TABLE products
  ADD COLUMN brand text,
  ADD COLUMN description text;

ALTER TABLE product_read_model
  ADD COLUMN brand text,
  ADD COLUMN description text;

ALTER TABLE products
  ADD CONSTRAINT products_brand_valid
    CHECK (
      brand IS NULL
      OR (
        brand ~ '[^[:space:]]'
        AND char_length(brand) <= 120
      )
    ),

  ADD CONSTRAINT products_description_valid
    CHECK (
      description IS NULL
      OR (
        description ~ '[^[:space:]]'
        AND char_length(description) <= 2000
      )
    );

ALTER TABLE product_read_model
  ADD CONSTRAINT product_read_model_brand_valid
    CHECK (
      brand IS NULL
      OR (
        brand ~ '[^[:space:]]'
        AND char_length(brand) <= 120
      )
    ),

  ADD CONSTRAINT product_read_model_description_valid
    CHECK (
      description IS NULL
      OR (
        description ~ '[^[:space:]]'
        AND char_length(description) <= 2000
      )
    );