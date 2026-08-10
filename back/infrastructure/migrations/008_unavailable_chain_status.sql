-- Предложение сохраняется в истории, если его товар уже ушёл в другой обмен.
-- Такой статус не путает недоступность товара с отменой предложения владельцем.
DO $$ BEGIN
    ALTER TABLE chains DROP CONSTRAINT IF EXISTS chains_status_check;
    ALTER TABLE chains
        ADD CONSTRAINT chains_status_check
        CHECK (status IN (
            'pending', 'active', 'completed', 'cancelled',
            'rejected', 'countered', 'failed', 'expired', 'unavailable'
        ));
END $$;

-- Разметить старые предложения, созданные до появления этого статуса.
UPDATE chains c
SET status = 'unavailable', updated_at = CURRENT_TIMESTAMP
WHERE c.status IN ('pending', 'active')
  AND EXISTS (
      SELECT 1
      FROM products p
      WHERE p.status = 'exchanged'
        AND (p.product_id = c.from_product_id OR p.product_id = c.to_product_id)
  );
