/**
 * Тестовые данные, вынесенные из тестов и page object'ов: одни и те же
 * значения нужны и в спеках, и в шагах подготовки (сид через API).
 */

export const TEST_PASSWORD = 'E2eTestPass123';

/**
 * Категория из базового сида (back/infrastructure/migrations/006_seed_mock_data.sql),
 * который поднимается вместе с тестовой БД. Используется и в UI-пикере категорий,
 * и при сидировании товаров напрямую через API.
 */
export const KNOWN_CATEGORY = {
    name: 'Видеокарты',
    rootName: 'Товары для компьютера',
};

/** Отдельная от KNOWN_CATEGORY категория — нужна как цель обмена, чтобы не путать «что отдаю» и «что хочу». */
export const TARGET_CATEGORY = {
    name: 'Игры для приставок',
};

export const PRODUCT_DEFAULTS = {
    description: 'Товар создан автотестом Playwright, состояние отличное.',
    price: '1500',
    location: 'Москва',
};

export const OFFER_DEFAULTS = {
    message: 'Здравствуйте! Предлагаю обмен, готов встретиться удобным способом.',
};

export const REVIEW_DEFAULTS = {
    rating: 5,
    comment: 'Обмен прошёл отлично, вещь полностью соответствует описанию.',
};
