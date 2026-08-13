import { expect, test } from '../fixtures/testFixtures';
import { KNOWN_CATEGORY, PRODUCT_DEFAULTS, TEST_PASSWORD } from '../fixtures/testData';
import { expectedMaskedName, generateProductTitle, generateTestEmail } from '../utils/testHelpers';

test.describe('Профиль пользователя', () => {
    test('новый пользователь регистрируется через форму и видит пустой профиль', async ({
        authPage,
        profilePage,
    }) => {
        const email = generateTestEmail();

        await authPage.open();
        await authPage.register(email, TEST_PASSWORD);

        await profilePage.openOwn();

        await expect.poll(() => profilePage.getDisplayName()).toBe(expectedMaskedName(email));
        await expect.poll(() => profilePage.getProductsCount()).toBe(0);
        await expect.poll(() => profilePage.getExchangesCount()).toBe(0);
    });

    test('товар, созданный пользователем, отражается в счётчике и списке профиля', async ({
        apiClient,
        createUserSession,
        signInAsSession,
        profilePage,
        page,
    }) => {
        const session = await createUserSession();
        const category = await apiClient.findCategoryByName(KNOWN_CATEGORY.name);
        const productTitle = generateProductTitle();

        await apiClient.createProduct(session.token, {
            customer_id: session.customerId,
            category_id: category.category_id,
            title: productTitle,
            description: PRODUCT_DEFAULTS.description,
            price: Number(PRODUCT_DEFAULTS.price),
            location: PRODUCT_DEFAULTS.location,
        });

        await signInAsSession(page, session);
        await profilePage.openOwn();

        await expect.poll(() => profilePage.getProductsCount()).toBe(1);
        await expect(profilePage.productRow(productTitle)).toBeVisible();
    });

    test('выход из аккаунта закрывает доступ к своему профилю', async ({
        createUserSession,
        signInAsSession,
        profilePage,
        page,
    }) => {
        const session = await createUserSession();

        await signInAsSession(page, session);
        await profilePage.openOwn();
        await profilePage.logout();

        await page.goto('/profile');
        await page.waitForURL(/\/auth/);
        await expect(page).toHaveURL(/\/auth/);
    });
});
