/**
 * Часть товаров без вишлиста получает 1-3 желаемые категории, чтобы карточка
 * не всегда показывала «Владелец не указал желаемые категории».
 *
 * Запуск: node scripts/generate-product-wishlists.mjs <products_without_wishlist.csv> <subcategories.csv>
 *   products_without_wishlist.csv — вывод
 *     psql -t -A -F',' -c "SELECT p.product_id, p.title FROM products p
 *       LEFT JOIN wishlists w ON w.product_id = p.product_id WHERE w.wishlist_id IS NULL;"
 *   subcategories.csv — вывод
 *     psql -t -A -F',' -c "SELECT category_id, name FROM categories WHERE parent_id IS NOT NULL;"
 * Результат: back/infrastructure/migrations/017_product_wishlists.sql
 */
import { createHash } from 'node:crypto';
import { writeFile, readFile } from 'node:fs/promises';

const outputPath = new URL('../back/infrastructure/migrations/017_product_wishlists.sql', import.meta.url);
const uuidNamespace = '6ba7b8119dad11d180b400c04fd430c8';
const [, , productsCsvPath, categoriesCsvPath] = process.argv;
if (!productsCsvPath || !categoriesCsvPath) {
    console.error('Использование: node scripts/generate-product-wishlists.mjs <products_without_wishlist.csv> <subcategories.csv>');
    process.exit(1);
}

function uuid(sourceId) {
    const namespace = Buffer.from(uuidNamespace, 'hex');
    const hash = createHash('sha1').update(namespace).update(sourceId).digest();
    hash[6] = (hash[6] & 0x0f) | 0x50;
    hash[8] = (hash[8] & 0x3f) | 0x80;
    const hex = hash.subarray(0, 16).toString('hex');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
function rng(seed) {
    let a = createHash('sha1').update(seed).digest().readUInt32LE(0) || 1;
    return () => {
        a |= 0; a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const int = (r, min, max) => Math.floor(r() * (max - min + 1)) + min;
function sqlVal(raw) {
    if (raw === null || raw === undefined) return 'NULL';
    return `'${String(raw).replaceAll("'", "''")}'`;
}
function parseCsv(text) {
    return text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const idx = line.indexOf(',');
            return [line.slice(0, idx), line.slice(idx + 1)];
        });
}

const products = parseCsv(await readFile(productsCsvPath, 'utf8'));
const categories = parseCsv(await readFile(categoriesCsvPath, 'utf8')).map(([id]) => id);

const nameTemplates = [
    'Что хочу получить взамен',
    'Рассмотрю обмен на это',
    'Интересны варианты обмена',
    'Ищу взамен что-то из списка',
    'Хочу выменять что-то отсюда',
    'Открыт(а) к обмену на следующее',
];

// Не у всех товаров должны быть предпочтения — часть владельцев
// действительно готова рассмотреть что угодно, это тоже реализм.
const coverage = 0.55;

const wishlistRows = [];
const optionRows = [];

for (const [productId] of products) {
    const r = rng(`product-wishlist-${productId}`);
    if (r() >= coverage) continue;

    const wishlistId = uuid(`product-wishlist-${productId}`);
    wishlistRows.push({
        wishlist_id: wishlistId,
        product_id: productId,
        name: nameTemplates[int(r, 0, nameTemplates.length - 1)],
    });

    const optionCount = int(r, 1, 3);
    const shuffled = [...categories].sort(() => r() - 0.5);
    for (const categoryId of shuffled.slice(0, optionCount)) {
        optionRows.push({ wishlist_id: wishlistId, category_id: categoryId });
    }
}

function insert(table, columns, rows) {
    if (rows.length === 0) return '';
    const records = rows.map((row) => `    (${columns.map((c) => sqlVal(row[c])).join(', ')})`).join(',\n');
    return `INSERT INTO ${table} (${columns.join(', ')}) VALUES\n${records}\nON CONFLICT DO NOTHING;\n`;
}

const sqlOut = [
    '-- GENERATED FILE. Source: scripts/generate-product-wishlists.mjs.',
    '-- Regenerate with: node scripts/generate-product-wishlists.mjs <products_without_wishlist.csv> <subcategories.csv>',
    '--',
    '-- Части товаров без вишлиста проставляются желаемые категории, чтобы',
    '-- карточка не всегда показывала «Владелец не указал желаемые категории».',
    '-- Оставшаяся часть — намеренно: не у каждого продавца есть предпочтения.',
    'BEGIN;',
    insert('wishlists', ['wishlist_id', 'product_id', 'name'], wishlistRows),
    insert('wishlist_options', ['wishlist_id', 'category_id'], optionRows),
    'COMMIT;\n',
].join('\n');

await writeFile(outputPath, sqlOut, 'utf8');
console.log(`Товаров без вишлиста: ${products.length}, получили вишлист: ${wishlistRows.length}, категорий-опций: ${optionRows.length}`);
console.log(`Создан ${outputPath.pathname}`);
