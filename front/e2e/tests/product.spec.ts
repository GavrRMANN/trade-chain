import { expect, test } from '../fixtures/testFixtures';
import { KNOWN_CATEGORY, PRODUCT_DEFAULTS, TARGET_CATEGORY } from '../fixtures/testData';
import { generateProductTitle } from '../utils/testHelpers';

test.describe('Создание товара', () => {
    test('пользователь публикует объявление через форму и видит его на странице товара', async ({
        createUserSession,
        signInAsSession,
        createProductPage,
        productPage,
        profilePage,
        page,
    }) => {
        const session = await createUserSession();
        const title = generateProductTitle();

        await signInAsSession(page, session);
        await createProductPage.open();

        const productId = await createProductPage.createProduct({
            title,
            categoryName: KNOWN_CATEGORY.name,
            description: PRODUCT_DEFAULTS.description,
            price: PRODUCT_DEFAULTS.price,
            location: PRODUCT_DEFAULTS.location,
            targetCategoryName: TARGET_CATEGORY.name,
        });

        await productPage.open(productId);
        await expect.poll(() => productPage.getTitle()).toBe(title);
        await expect.poll(() => productPage.isEditableByCurrentUser()).toBe(true);

        await profilePage.openOwn();
        await expect(profilePage.productRow(title)).toBeVisible();
    });
});
