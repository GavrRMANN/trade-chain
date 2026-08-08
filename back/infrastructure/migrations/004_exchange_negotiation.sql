-- Переговоры по звену обмена.
--
-- Таблица chains до сих пор описывала только факт «этот товар меняется на тот»:
-- у звена есть инициатор, статус и одно сообщение при создании. Всё остальное,
-- из чего состоит живая сделка — переписка, срок ответа, подтверждение итога
-- обеими сторонами и отзыв по результату — здесь и добавляется.
--
-- Миграцию безопасно прогнать повторно.

-- ---------- chains: вторая сторона ----------

-- Кто отвечает на предложение, до сих пор вычислялось на лету — через
-- владельца запрошенного товара. После успешного обмена владельцы меняются
-- местами, и то же вычисление начинает указывать на инициатора: сделка
-- «схлопывается» в одного человека, и отзыв оставить уже некому.
-- Поэтому вторая сторона фиксируется в момент создания предложения.
ALTER TABLE chains
    ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES customers(customer_id) ON DELETE CASCADE;

UPDATE chains c
SET recipient_id = p.customer_id
FROM products p
WHERE p.product_id = c.to_product_id
  AND c.recipient_id IS NULL;

ALTER TABLE chains ALTER COLUMN recipient_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chains_recipient_id ON chains(recipient_id);

-- ---------- chains: срок ответа и недостающие состояния ----------

-- Предложение без срока висит вечно и занимает внимание обеих сторон:
-- получатель не отвечает, инициатор не понимает, ждать ему или нет.
ALTER TABLE chains
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE
        NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '72 hours');

-- countered — получатель предложил свой вариант вместо предложенного;
-- failed — договорились, но обмен не состоялся;
-- expired — ответа не дождались.
DO $$ BEGIN
    ALTER TABLE chains DROP CONSTRAINT IF EXISTS chains_status_check;
    ALTER TABLE chains
        ADD CONSTRAINT chains_status_check
        CHECK (status IN (
            'pending', 'active', 'completed', 'cancelled',
            'rejected', 'countered', 'failed', 'expired'
        ));
END $$;

-- ---------- переписка ----------

-- Чат привязан к звену, а не к паре пользователей: у обсуждения всегда есть
-- предмет, и обе стороны видят, о каком именно обмене идёт речь.
CREATE TABLE IF NOT EXISTS chain_messages (
    message_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id    UUID NOT NULL REFERENCES chains(chain_id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    body        TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chain_message_not_empty CHECK (length(btrim(body)) > 0)
);

-- Переписка всегда читается целиком по одному звену и по возрастанию времени.
CREATE INDEX IF NOT EXISTS idx_chain_messages_chain_created
    ON chain_messages(chain_id, created_at);

-- ---------- подтверждение итога ----------

-- Одна строка на человека: первичный ключ не даёт подтвердить дважды и
-- переголосовать задним числом, даже если приложение об этом забудет.
CREATE TABLE IF NOT EXISTS chain_confirmations (
    chain_id    UUID NOT NULL REFERENCES chains(chain_id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    success     BOOLEAN NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (chain_id, customer_id)
);

-- ---------- отзывы ----------

-- Отзыв без сделки — это оценка незнакомому человеку: сейчас поставить её
-- может кто угодно кому угодно. Привязка к звену даёт основание для оценки.
-- Колонка chain_id допускает NULL ради отзывов, заведённых до этой миграции.
ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS chain_id UUID REFERENCES chains(chain_id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS comment  TEXT NOT NULL DEFAULT '';

-- Один отзыв на сделку от одного человека, иначе оценку можно накрутить
-- повторными отправками.
CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_chain_author
    ON reviews(chain_id, from_customer_id)
    WHERE chain_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reviews_chain_id ON reviews(chain_id);
