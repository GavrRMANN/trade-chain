/**
 * Достраивает SVG-плейсхолдеры для товаров, у которых image пустой —
 * ручные тестовые объявления, заведённые мимо сидов (см. запрос
 * `SELECT ... WHERE image = ''`). Картинка — та же процедурная генерация,
 * что и в generate-bulk-test-data.mjs, seed = product_id.
 *
 * Запуск: node scripts/backfill-product-images.mjs
 * Результат: back/infrastructure/migrations/015_backfill_missing_product_images.sql
 */
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const outputPath = new URL('../back/infrastructure/migrations/015_backfill_missing_product_images.sql', import.meta.url);

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

function svgPlaceholder(seed, monogram) {
    const r = rng(seed);
    const hue = int(r, 0, 359);
    const bg = `hsl(${hue} 55% 42%)`;
    const accent = `hsl(${(hue + 40) % 360} 70% 62%)`;
    const shapes = [];
    const shapeCount = int(r, 2, 4);
    for (let i = 0; i < shapeCount; i++) {
        const cx = int(r, 20, 380);
        const cy = int(r, 20, 280);
        const radius = int(r, 30, 110);
        shapes.push(`<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${accent}" opacity="0.35"/>`);
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${bg}"/>${shapes.join('')}<text x="200" y="172" font-family="sans-serif" font-size="108" font-weight="700" fill="#ffffff" fill-opacity="0.92" text-anchor="middle">${monogram}</text></svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// product_id + title взяты из `SELECT product_id, title FROM products WHERE image = '' OR image IS NULL`.
const targets = [
    ['cfc4896d-6ef9-594c-91ca-cf9a0248886b', 'GTA V для PS4'],
    ['cf28bf4e-36ae-5c96-8a61-113f6c9f2a3a', 'Halo Infinite для Xbox'],
    ['e3888f94-e2c7-4cb4-9656-a01911d536cc', 'Велик 3'],
    ['9361d234-2601-4cff-9635-b1344c9f3a10', 'Велосипед'],
    ['e7f13528-f7ea-4fea-bae7-ce5282019e4e', 'Велосипед'],
    ['8cc24817-722a-4191-9704-f6ed31432611', 'Велосипед 2'],
    ['b337b8f3-49cf-5e4d-ba3a-4ad424cf256f', 'Видеокарта GTX 1660 Super'],
    ['2277fbaa-76d6-47a7-9b75-92c53663e482', 'Видеокарта GTX 1660 Super'],
    ['e521eae7-f089-495c-b242-836ca983c834', 'ОЗУ DDR 5'],
    ['cfa82e6a-686d-42df-a99c-c187b3515a7e', 'ОЗУ DDR 5'],
    ['ad0a87cc-fd88-4003-a01c-35ee5a346a5d', 'Оперативная память'],
    ['bf3700c0-8df4-4d3d-9e22-b361245f75e5', 'Хз что'],
];

const statements = targets.map(([id, title]) => {
    const monogram = [...title.trim()].slice(0, 2).join('').toUpperCase();
    const image = svgPlaceholder(id, monogram);
    return `UPDATE products SET image = '${image}' WHERE product_id = '${id}' AND (image = '' OR image IS NULL);`;
});

const sqlOut = [
    '-- GENERATED FILE. Source: scripts/backfill-product-images.mjs.',
    '-- Regenerate with: node scripts/backfill-product-images.mjs',
    '-- Достраивает SVG-плейсхолдеры товарам без картинки (ручные тестовые',
    '-- объявления, заведённые мимо сидов). Условие в WHERE не даёт затереть',
    '-- картинку, если пользователь успел загрузить свою.',
    'BEGIN;',
    ...statements,
    'COMMIT;\n',
].join('\n');

await writeFile(outputPath, sqlOut, 'utf8');
console.log(`Обновлено товаров: ${targets.length}`);
console.log(`Создан ${outputPath.pathname}`);
