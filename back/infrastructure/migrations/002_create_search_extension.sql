CREATE EXTENSION IF NOT EXISTS pg_trgm;


ALTER TABLE products
ADD COLUMN IF NOT EXISTS search_vector tsvector;


UPDATE products
SET search_vector =
    to_tsvector(
        'russian',
        coalesce(name, '') || ' ' ||
        coalesce(description, '')
    );


CREATE INDEX IF NOT EXISTS products_search_vector_idx
ON products
USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS products_name_trgm_idx
ON products
USING GIN(name gin_trgm_ops);

CREATE OR REPLACE FUNCTION products_search_update()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        to_tsvector(
            'russian',
            coalesce(NEW.name, '') || ' ' ||
            coalesce(NEW.description, '')
        );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS products_search_trigger ON products;


CREATE TRIGGER products_search_trigger
BEFORE INSERT OR UPDATE
ON products
FOR EACH ROW
EXECUTE FUNCTION products_search_update();