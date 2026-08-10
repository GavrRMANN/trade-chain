-- Цель обмена — категория вместо конкретного товара.
--
-- Пока цель всегда привязана к товару: to_product_id NOT NULL и recipient_id
-- вычисляется из владельца этого товара. Но при создании объявления пользователь
-- может выбрать категорию как цель: «хочу любую вещь из этой категории».
--
-- Миграция безопасна к повторному запуску.

-- ---------- chains: to_category_id ----------

ALTER TABLE chains
    ADD COLUMN IF NOT EXISTS to_category_id UUID REFERENCES categories(category_id) ON DELETE SET NULL;

-- Разрешить пустой to_product_id, если задана категория.
ALTER TABLE chains ALTER COLUMN to_product_id DROP NOT NULL;

-- Гарантия: хотя бы один тип цели указан.
DO $$ BEGIN
    ALTER TABLE chains
        ADD CONSTRAINT chains_goal_required
        CHECK (to_product_id IS NOT NULL OR to_category_id IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- При цели-категории получатель неизвестен: обмен не с конкретным человеком.
ALTER TABLE chains ALTER COLUMN recipient_id DROP NOT NULL;

-- Обновить уникальный индекс: при category goal to_product_id NULL.
DROP INDEX IF EXISTS chains_one_pending_offer;
CREATE UNIQUE INDEX chains_one_pending_offer
    ON chains(initiator_id, from_product_id, COALESCE(to_product_id, '00000000-0000-0000-0000-000000000000'))
    WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_chains_to_category_id
    ON chains(to_category_id) WHERE to_category_id IS NOT NULL;
