-- Таблица пользователей
CREATE TABLE IF NOT EXISTS customers (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Таблица категорий (с поддержкой подкатегорий)
CREATE TABLE IF NOT EXISTS categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES categories(category_id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица товаров (объявлений)
CREATE TABLE IF NOT EXISTS products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(category_id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица вишлистов (желаний пользователя)
CREATE TABLE IF NOT EXISTS wishlists (
    wishlist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL UNIQUE REFERENCES products(product_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица связей категорий с вишлистами (многие ко многим)
CREATE TABLE IF NOT EXISTS wishlist_options (
    wishlist_id UUID NOT NULL REFERENCES wishlists(wishlist_id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    PRIMARY KEY (wishlist_id, category_id)
);

-- Таблица цепочек обмена
CREATE TABLE IF NOT EXISTS chains (
    chain_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    to_product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    previous_chain_id UUID REFERENCES chains(chain_id) ON DELETE SET NULL,
    next_chain_id UUID REFERENCES chains(chain_id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chain_id, previous_chain_id, next_chain_id)
);

-- Таблица отзывов
CREATE TABLE IF NOT EXISTS reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    to_customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(product_id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_products_customer_id ON products(customer_id);
CREATE INDEX IF NOT EXISTS  idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS  idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS  idx_wishlists_product_id ON wishlists(product_id);
CREATE INDEX IF NOT EXISTS  idx_chains_from_product_id ON chains(from_product_id);
CREATE INDEX IF NOT EXISTS  idx_chains_to_product_id ON chains(to_product_id);
CREATE INDEX IF NOT EXISTS  idx_chains_status ON chains(status);
CREATE INDEX IF NOT EXISTS  idx_reviews_to_customer_id ON reviews(to_customer_id);
CREATE INDEX IF NOT EXISTS  idx_reviews_from_customer_id ON reviews(from_customer_id);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_wishlists_updated_at BEFORE UPDATE ON wishlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_chains_updated_at BEFORE UPDATE ON chains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();