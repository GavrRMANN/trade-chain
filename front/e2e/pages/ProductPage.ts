import type { Locator } from '@playwright/test';

import { BasePage } from './BasePage';

/** Страница товара, маршрут `/product/:productId` (pages/product/ProductPage). */
export class ProductPage extends BasePage {
    private readonly heading: Locator = this.page.locator('h1').first();
    private readonly offerButton: Locator = this.page.getByRole('button', { name: 'Предложить обмен' });
    private readonly editButton: Locator = this.page.getByRole('button', { name: 'Редактировать' });

    async open(productId: string): Promise<void> {
        await this.goto(`/product/${productId}`);
        await this.heading.waitFor({ state: 'visible' });
    }

    async getTitle(): Promise<string> {
        return (await this.heading.textContent())?.trim() ?? '';
    }

    async clickOfferExchange(): Promise<void> {
        await this.offerButton.click();
    }

    async isEditableByCurrentUser(): Promise<boolean> {
        return this.editButton.isVisible();
    }
}
