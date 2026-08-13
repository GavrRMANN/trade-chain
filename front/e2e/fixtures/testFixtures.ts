import { test as base, expect, type Page } from '@playwright/test';

import { AuthPage } from '../pages/AuthPage';
import { CreateProductPage } from '../pages/CreateProductPage';
import { ExchangeRoomPage } from '../pages/ExchangeRoomPage';
import { OfferModal } from '../pages/OfferModal';
import { ProductPage } from '../pages/ProductPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ApiClient } from '../utils/apiClient';
import { generateTestEmail } from '../utils/testHelpers';
import { TEST_PASSWORD } from './testData';

export type TUserSession = {
    email: string;
    password: string;
    token: string;
    customerId: string;
};

type TFixtures = {
    apiClient: ApiClient;
    authPage: AuthPage;
    profilePage: ProfilePage;
    createProductPage: CreateProductPage;
    productPage: ProductPage;
    offerModal: OfferModal;
    exchangeRoomPage: ExchangeRoomPage;
    /** Регистрирует нового одноразового пользователя через реальный API (не мок) и возвращает его сессию. */
    createUserSession: () => Promise<TUserSession>;
    /** Подставляет JWT сессии в localStorage до первой загрузки страницы — минуя форму входа. */
    signInAsSession: (page: Page, session: TUserSession) => Promise<void>;
};

export const test = base.extend<TFixtures>({
    apiClient: async ({ request }, use) => {
        await use(new ApiClient(request));
    },

    authPage: async ({ page }, use) => {
        await use(new AuthPage(page));
    },

    profilePage: async ({ page }, use) => {
        await use(new ProfilePage(page));
    },

    createProductPage: async ({ page }, use) => {
        await use(new CreateProductPage(page));
    },

    productPage: async ({ page }, use) => {
        await use(new ProductPage(page));
    },

    offerModal: async ({ page }, use) => {
        await use(new OfferModal(page));
    },

    exchangeRoomPage: async ({ page }, use) => {
        await use(new ExchangeRoomPage(page));
    },

    createUserSession: async ({ apiClient }, use) => {
        await use(async () => {
            const email = generateTestEmail();
            const session = await apiClient.register(email, TEST_PASSWORD);
            return {
                email,
                password: TEST_PASSWORD,
                token: session.token,
                customerId: session.customer.customer_id,
            };
        });
    },

    // eslint-disable-next-line no-empty-pattern -- Playwright требует именно объектную деструктуризацию в первом аргументе.
    signInAsSession: async ({}, use) => {
        await use(async (page, session) => {
            await page.addInitScript((token) => {
                window.localStorage.setItem('token', token);
            }, session.token);
            await page.goto('/');
        });
    },
});

export { expect };
