import { expect, test } from '../fixtures/testFixtures';
import {
    KNOWN_CATEGORY,
    OFFER_DEFAULTS,
    PRODUCT_DEFAULTS,
    REVIEW_DEFAULTS,
} from '../fixtures/testData';
import { ExchangeRoomPage } from '../pages/ExchangeRoomPage';
import { generateProductTitle } from '../utils/testHelpers';

test.describe('Цепочка обмена', () => {
    test('покупатель предлагает обмен, продавец принимает, обе стороны подтверждают и покупатель оставляет отзыв', async ({
        browser,
        apiClient,
        createUserSession,
        signInAsSession,
        productPage,
        offerModal,
        exchangeRoomPage,
        page,
    }) => {
        const seller = await createUserSession();
        const buyer = await createUserSession();
        const category = await apiClient.findCategoryByName(KNOWN_CATEGORY.name);

        const sellerProductTitle = generateProductTitle('Товар продавца');
        const buyerProductTitle = generateProductTitle('Товар покупателя');

        const sellerProduct = await apiClient.createProduct(seller.token, {
            customer_id: seller.customerId,
            category_id: category.category_id,
            title: sellerProductTitle,
            description: PRODUCT_DEFAULTS.description,
            price: Number(PRODUCT_DEFAULTS.price),
            location: PRODUCT_DEFAULTS.location,
        });
        await apiClient.createProduct(buyer.token, {
            customer_id: buyer.customerId,
            category_id: category.category_id,
            title: buyerProductTitle,
            description: PRODUCT_DEFAULTS.description,
            price: Number(PRODUCT_DEFAULTS.price),
            location: PRODUCT_DEFAULTS.location,
        });

        // Покупатель: открывает товар продавца и предлагает свой в обмен.
        await signInAsSession(page, buyer);
        await productPage.open(sellerProduct.product_id);
        await productPage.clickOfferExchange();
        await offerModal.waitForOpen();
        await offerModal.selectMyProduct(buyerProductTitle);
        await offerModal.fillMessage(OFFER_DEFAULTS.message);
        const chainId = await offerModal.submitAndGetChainId();

        await exchangeRoomPage.open(chainId);
        await exchangeRoomPage.waitForStatusLabel('Ожидает');

        // Продавец: отдельная сессия (второй браузерный контекст), принимает предложение.
        const sellerContext = await browser.newContext();
        try {
            const sellerPage = await sellerContext.newPage();
            await signInAsSession(sellerPage, seller);
            const sellerExchangeRoom = new ExchangeRoomPage(sellerPage);

            await sellerExchangeRoom.open(chainId);
            await sellerExchangeRoom.waitForStatusLabel('Ожидает');
            await sellerExchangeRoom.accept();
            await sellerExchangeRoom.waitForStatusLabel('Идёт обмен');

            // Покупатель видит принятое предложение и подтверждает, что обмен состоялся.
            await exchangeRoomPage.open(chainId);
            await exchangeRoomPage.waitForStatusLabel('Идёт обмен');
            await exchangeRoomPage.confirmExchangeSucceeded();
            await expect.poll(() => exchangeRoomPage.isWaitingForOtherConfirmation()).toBe(true);

            // Продавец подтверждает вторым — сделка закрывается для обеих сторон.
            await sellerExchangeRoom.open(chainId);
            await sellerExchangeRoom.confirmExchangeSucceeded();
        } finally {
            await sellerContext.close();
        }

        await exchangeRoomPage.open(chainId);
        await exchangeRoomPage.waitForStatusLabel('Завершён');

        await exchangeRoomPage.leaveReview(REVIEW_DEFAULTS.rating, REVIEW_DEFAULTS.comment);
        await expect.poll(() => exchangeRoomPage.isReviewSentVisible()).toBe(true);
    });
});
