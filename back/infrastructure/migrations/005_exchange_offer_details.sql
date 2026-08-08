-- Детали предложения обмена: цель, шаг маршрута и доплата.
--
-- Предложение из API описывает не только «этот товар на тот»: у него есть
-- контекст пути к цели и деньги, которыми выравнивают разницу в стоимости.
-- Отдельные таблицы под это не заводятся — предложение и сделка это одно и то
-- же звено, и лишний JOIN здесь ничего не объясняет.
--
-- Миграцию безопасно прогнать повторно.

-- ---------- контекст цели ----------

-- Предложение может быть отправлено с экрана «Обмены» — тогда оно шаг в
-- маршруте к цели, а может быть прямым обменом из карточки товара.
-- Внешних ключей нет намеренно: таблиц целей и маршрутов в схеме ещё нет,
-- а связь нужна уже сейчас, чтобы ответ сервера не терял, откуда пришёл шаг.
ALTER TABLE chains
    ADD COLUMN IF NOT EXISTS exchange_goal_id UUID,
    ADD COLUMN IF NOT EXISTS route_step_id    UUID;

CREATE INDEX IF NOT EXISTS idx_chains_exchange_goal_id
    ON chains(exchange_goal_id)
    WHERE exchange_goal_id IS NOT NULL;

-- ---------- доплата ----------

-- Разница в стоимости вещей — обычная часть обмена, и договорённость о ней
-- должна лежать в предложении, а не в переписке: иначе на встрече выясняется,
-- что стороны поняли её по-разному.
ALTER TABLE chains
    ADD COLUMN IF NOT EXISTS surcharge_amount   INTEGER     NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS surcharge_currency CHAR(3)     NOT NULL DEFAULT 'RUB',
    ADD COLUMN IF NOT EXISTS surcharge_payer    UUID        REFERENCES customers(customer_id) ON DELETE SET NULL;

-- Доплата без плательщика — это сумма, которую никто не должен: непонятно,
-- кто кому доплачивает. Обратное тоже бессмысленно: плательщик нуля.
DO $$ BEGIN
    ALTER TABLE chains DROP CONSTRAINT IF EXISTS chains_surcharge_check;
    ALTER TABLE chains
        ADD CONSTRAINT chains_surcharge_check
        CHECK (
            surcharge_amount >= 0
            AND (surcharge_amount = 0) = (surcharge_payer IS NULL)
        );
END $$;

-- ---------- защита от дублей ----------

-- Близнецы, созданные до этого ограничения, закрываются: живым остаётся самое
-- раннее предложение. Без этого уникальный индекс не создастся, и миграция
-- упадёт на базе, в которой уже кто-то нажимал кнопку дважды.
UPDATE chains c
SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
WHERE c.status = 'pending'
  AND EXISTS (
      SELECT 1
      FROM chains earlier
      WHERE earlier.status = 'pending'
        AND earlier.initiator_id = c.initiator_id
        AND earlier.from_product_id = c.from_product_id
        AND earlier.to_product_id = c.to_product_id
        AND (earlier.created_at, earlier.chain_id) < (c.created_at, c.chain_id)
  );

-- Повторное нажатие кнопки не должно превращаться во второе предложение по той
-- же паре товаров: у получателя в списке появляются близнецы, и непонятно, на
-- какой из них отвечать. Ограничение частичное — после отказа или отмены
-- предложить снова можно.
CREATE UNIQUE INDEX IF NOT EXISTS chains_one_pending_offer
    ON chains(initiator_id, from_product_id, to_product_id)
    WHERE status = 'pending';

-- ---------- причина неудачи ----------

-- «Обмен не состоялся» без объяснения — это отказ, на который вторая сторона
-- не может ничего возразить. Причина остаётся в подтверждении и видна обоим.
ALTER TABLE chain_confirmations
    ADD COLUMN IF NOT EXISTS reason TEXT NOT NULL DEFAULT '';
