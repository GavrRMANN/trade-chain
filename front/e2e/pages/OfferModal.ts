import type { Locator } from '@playwright/test';

import { waitForModalOpen, waitForUrlToMatch } from '../utils/waits';
import { BasePage } from './BasePage';

/**
 * Модалка предложения обмена, маршрут `/product/:productId/offer`
 * (features/exchange/OfferExchangeModal).
 */
export class OfferModal extends BasePage {
    private readonly messageInput: Locator = this.page.getByLabel('Сообщение продавцу');
    private readonly submitButton: Locator = this.page.getByRole('dialog').getByRole('button', {
        name: 'Предложить обмен',
    });

    async waitForOpen(): Promise<void> {
        await waitForModalOpen(this.page, 'Предложить обмен');
    }

    /** Выбирает карточку своего товара в гриде «Выберите ваш товар» по названию. */
    async selectMyProduct(productTitle: string): Promise<void> {
        await this.page.getByRole('dialog').getByRole('button', { name: productTitle }).click();
    }

    async fillMessage(message: string): Promise<void> {
        await this.messageInput.fill(message);
    }

    /** Отправляет предложение и дожидается перехода в комнату обмена `/exchanges/:chainId`. */
    async submitAndGetChainId(): Promise<string> {
        await this.submitButton.click();
        await waitForUrlToMatch(this.page, /\/exchanges\/[^/?]+/);
        const match = /\/exchanges\/([^/?]+)/.exec(this.page.url());
        if (!match) {
            throw new Error(
                'Не удалось получить id цепочки обмена из URL после отправки предложения',
            );
        }
        return match[1];
    }
}
