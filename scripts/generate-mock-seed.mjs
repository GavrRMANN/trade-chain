/**
 * Создаёт SQL-сид из данных front/mock-api/data.js.
 *
 * В mock API идентификаторы удобочитаемые строки, а схема PostgreSQL хранит
 * UUID. Одинаковый исходный идентификатор всегда преобразуется в одинаковый
 * UUID, поэтому внешние ключи в сиде остаются целостными.
 */
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import {
    categories,
    chainMessages,
    chains,
    confirmations,
    customers,
    products,
    reviews,
    wishlistOptions,
    wishlists,
} from '../front/mock-api/data.js';

const outputPath = new URL('../back/infrastructure/migrations/006_seed_mock_data.sql', import.meta.url);
const uuidNamespace = '6ba7b8119dad11d180b400c04fd430c8';
const passwordHash = '$2y$10$7fpSvEXlg0/63LutgOzEyeCMYUyegqEZ3P67sZsN0y0khT0JCghMy';

function uuid(sourceId) {
    const namespace = Buffer.from(uuidNamespace, 'hex');
    const hash = createHash('sha1').update(namespace).update(sourceId).digest();
    hash[6] = (hash[6] & 0x0f) | 0x50;
    hash[8] = (hash[8] & 0x3f) | 0x80;
    const hex = hash.subarray(0, 16).toString('hex');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function value(raw) {
    if (raw === null || raw === undefined) return 'NULL';
    if (typeof raw === 'boolean') return raw ? 'TRUE' : 'FALSE';
    if (typeof raw === 'number') return String(raw);
    return `'${String(raw).replaceAll("'", "''")}'`;
}

function insert(table, columns, rows) {
    if (rows.length === 0) return '';
    const records = rows
        .map((row) => `    (${columns.map((column) => value(row[column])).join(', ')})`)
        .join(',\n');
    return `INSERT INTO ${table} (${columns.join(', ')}) VALUES\n${records}\nON CONFLICT DO NOTHING;\n`;
}

function assert(condition, message) {
    if (!condition) throw new Error(`Неконсистентные mock-данные: ${message}`);
}

function indexBy(items, key, name) {
    const index = new Map();
    for (const item of items) {
        assert(!index.has(item[key]), `повторяющийся ${name}: ${item[key]}`);
        index.set(item[key], item);
    }
    return index;
}

function validateMockData() {
    const categoriesById = indexBy(categories, 'category_id', 'ID категории');
    const customersById = indexBy(customers, 'customer_id', 'ID пользователя');
    const productsById = indexBy(products, 'product_id', 'ID товара');
    const chainsById = indexBy(chains, 'chain_id', 'ID обмена');
    const wishlistsById = indexBy(wishlists, 'wishlist_id', 'ID вишлиста');

    for (const category of categories) {
        assert(!category.parent_id || categoriesById.has(category.parent_id), `категория ${category.category_id} ссылается на несуществующего родителя`);
    }
    for (const product of products) {
        assert(customersById.has(product.customer_id), `у товара ${product.product_id} нет существующего владельца`);
        assert(!product.category_id || categoriesById.has(product.category_id), `у товара ${product.product_id} несуществующая категория`);
    }
    for (const wishlist of wishlists) {
        assert(productsById.has(wishlist.product_id), `вишлист ${wishlist.wishlist_id} ссылается на несуществующий товар`);
    }
    for (const [wishlistId, categoryIds] of Object.entries(wishlistOptions)) {
        assert(wishlistsById.has(wishlistId), `опции ссылаются на несуществующий вишлист ${wishlistId}`);
        for (const categoryId of categoryIds) {
            assert(categoriesById.has(categoryId), `вишлист ${wishlistId} ссылается на несуществующую категорию ${categoryId}`);
        }
    }
    for (const chain of chains) {
        const offered = productsById.get(chain.from_product_id);
        const requested = productsById.get(chain.to_product_id);
        assert(offered && requested, `обмен ${chain.chain_id} ссылается на несуществующий товар`);
        assert(chain.from_product_id !== chain.to_product_id, `в обмене ${chain.chain_id} указан один и тот же товар`);
        assert(customersById.has(chain.initiator_id) && customersById.has(chain.recipient_id), `у обмена ${chain.chain_id} несуществующий участник`);
        assert(chain.initiator_id !== chain.recipient_id, `в обмене ${chain.chain_id} участвует один пользователь`);
        const ownersMatch = chain.status === 'completed'
            ? offered.customer_id === chain.recipient_id && requested.customer_id === chain.initiator_id
            : offered.customer_id === chain.initiator_id && requested.customer_id === chain.recipient_id;
        assert(ownersMatch, `владельцы товаров не соответствуют участникам обмена ${chain.chain_id}`);
    }
    for (const messages of Object.values(chainMessages)) {
        for (const message of messages) {
            const chain = chainsById.get(message.chain_id);
            assert(chain, `сообщение ${message.message_id} ссылается на несуществующий обмен`);
            assert([chain.initiator_id, chain.recipient_id].includes(message.customer_id), `автор сообщения ${message.message_id} не участвует в обмене`);
        }
    }
    for (const [chainId, items] of Object.entries(confirmations)) {
        const chain = chainsById.get(chainId);
        assert(chain, `подтверждения ссылаются на несуществующий обмен ${chainId}`);
        const confirmed = new Set();
        for (const confirmation of items) {
            assert([chain.initiator_id, chain.recipient_id].includes(confirmation.customer_id), `подтверждающий не участвует в обмене ${chainId}`);
            assert(!confirmed.has(confirmation.customer_id), `повторное подтверждение пользователя в обмене ${chainId}`);
            confirmed.add(confirmation.customer_id);
        }
    }
    for (const review of reviews) {
        const chain = chainsById.get(review.chain_id);
        assert(chain?.status === 'completed', `отзыв ${review.review_id} не связан с завершённым обменом`);
        assert([chain.initiator_id, chain.recipient_id].includes(review.from_customer_id), `автор отзыва ${review.review_id} не участвует в обмене`);
        assert([chain.initiator_id, chain.recipient_id].includes(review.to_customer_id) && review.from_customer_id !== review.to_customer_id, `получатель отзыва ${review.review_id} указан неверно`);
        assert([chain.from_product_id, chain.to_product_id].includes(review.product_id), `отзыв ${review.review_id} ссылается на товар из другой сделки`);
    }
}

validateMockData();

const categoryRows = categories.map((item) => ({
    category_id: uuid(item.category_id),
    name: item.name,
    parent_id: item.parent_id ? uuid(item.parent_id) : null,
    created_at: item.created_at,
    updated_at: item.updated_at,
}));

const customerRows = customers.map((item) => ({
    customer_id: uuid(item.customer_id),
    email: item.email,
    password_hash: passwordHash,
    created_at: item.created_at,
    updated_at: item.updated_at,
    is_active: item.is_active,
}));

const productRows = products.map((item) => ({
    product_id: uuid(item.product_id),
    customer_id: uuid(item.customer_id),
    category_id: item.category_id ? uuid(item.category_id) : null,
    title: item.title,
    description: item.description,
    image: item.image,
    price: item.price,
    location: item.location,
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at,
}));

const chainRows = chains.map((item) => ({
    chain_id: uuid(item.chain_id),
    from_product_id: uuid(item.from_product_id),
    to_product_id: uuid(item.to_product_id),
    initiator_id: uuid(item.initiator_id),
    recipient_id: uuid(item.recipient_id),
    status: item.status,
    message: item.message,
    expires_at: item.expires_at,
    surcharge_amount: item.surcharge.amount,
    surcharge_currency: item.surcharge.currency,
    surcharge_payer: item.surcharge.payer ? uuid(item.surcharge.payer) : null,
    created_at: item.created_at,
    updated_at: item.updated_at,
}));

const messageRows = Object.values(chainMessages)
    .flat()
    .map((item) => ({
        message_id: uuid(item.message_id),
        chain_id: uuid(item.chain_id),
        customer_id: uuid(item.customer_id),
        body: item.body,
        created_at: item.created_at,
    }));

const confirmationRows = Object.entries(confirmations)
    .flatMap(([chainId, items]) =>
        items.map((item) => ({
            chain_id: uuid(chainId),
            customer_id: uuid(item.customer_id),
            success: item.success,
            reason: item.reason ?? '',
            created_at: item.created_at,
        })),
    );

const reviewRows = reviews.map((item) => ({
    review_id: uuid(item.review_id),
    chain_id: item.chain_id ? uuid(item.chain_id) : null,
    from_customer_id: uuid(item.from_customer_id),
    to_customer_id: uuid(item.to_customer_id),
    product_id: item.product_id ? uuid(item.product_id) : null,
    rating: item.rating,
    comment: item.comment,
    created_at: item.created_at,
    updated_at: item.updated_at,
}));

const wishlistRows = wishlists.map((item) => ({
    wishlist_id: uuid(item.wishlist_id),
    product_id: uuid(item.product_id),
    name: item.name,
    created_at: item.created_at,
    updated_at: item.updated_at,
}));

const wishlistOptionRows = Object.entries(wishlistOptions).flatMap(([wishlistId, categoryIds]) =>
    categoryIds.map((categoryId) => ({
        wishlist_id: uuid(wishlistId),
        category_id: uuid(categoryId),
    })),
);

const sql = [
    '-- GENERATED FILE. Source: front/mock-api/data.js.',
    '-- Regenerate with: node scripts/generate-mock-seed.mjs',
    '-- All mock accounts use password: password123.',
    'BEGIN;',
    insert('categories', ['category_id', 'name', 'parent_id', 'created_at', 'updated_at'], categoryRows),
    insert('customers', ['customer_id', 'email', 'password_hash', 'created_at', 'updated_at', 'is_active'], customerRows),
    insert('products', ['product_id', 'customer_id', 'category_id', 'title', 'description', 'image', 'price', 'location', 'status', 'created_at', 'updated_at'], productRows),
    insert('wishlists', ['wishlist_id', 'product_id', 'name', 'created_at', 'updated_at'], wishlistRows),
    insert('wishlist_options', ['wishlist_id', 'category_id'], wishlistOptionRows),
    insert('chains', ['chain_id', 'from_product_id', 'to_product_id', 'initiator_id', 'recipient_id', 'status', 'message', 'expires_at', 'surcharge_amount', 'surcharge_currency', 'surcharge_payer', 'created_at', 'updated_at'], chainRows),
    insert('chain_messages', ['message_id', 'chain_id', 'customer_id', 'body', 'created_at'], messageRows),
    insert('chain_confirmations', ['chain_id', 'customer_id', 'success', 'reason', 'created_at'], confirmationRows),
    insert('reviews', ['review_id', 'chain_id', 'from_customer_id', 'to_customer_id', 'product_id', 'rating', 'comment', 'created_at', 'updated_at'], reviewRows),
    'COMMIT;\n',
].join('\n');

await writeFile(outputPath, sql, 'utf8');
console.log(`Создан ${outputPath.pathname}`);
