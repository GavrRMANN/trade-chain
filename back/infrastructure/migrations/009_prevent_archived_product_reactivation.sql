CREATE OR REPLACE FUNCTION prevent_archived_product_reactivation()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'archived' AND NEW.status IS DISTINCT FROM 'archived' THEN
        RAISE EXCEPTION 'archived product status cannot be changed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_prevent_archived_reactivation
BEFORE UPDATE OF status ON products
FOR EACH ROW
EXECUTE FUNCTION prevent_archived_product_reactivation();
