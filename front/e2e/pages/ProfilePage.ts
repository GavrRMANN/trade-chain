import type { Locator } from '@playwright/test';

import { BasePage } from './BasePage';

type TProfileTab = 'Товары' | 'Архив' | 'Цепочки обменов' | 'Отзывы';

/** Профиль пользователя, маршруты `/profile` (свой) и `/profile/:id` (чужой). */
export class ProfilePage extends BasePage {
    private readonly heading: Locator = this.page.locator('h1').first();
    private readonly statsBlock: Locator = this.page.locator('[aria-label="Статистика профиля"]');
    private readonly logoutButton: Locator = this.page.getByRole('button', { name: 'Выйти' });
    private readonly addProductButton: Locator = this.page.getByRole('button', {
        name: 'Добавить товар',
    });

    async openOwn(): Promise<void> {
        await this.goto('/profile');
        await this.heading.waitFor({ state: 'visible' });
    }

    async openOf(customerId: string): Promise<void> {
        await this.goto(`/profile/${customerId}`);
        await this.heading.waitFor({ state: 'visible' });
    }

    async getDisplayName(): Promise<string> {
        return (await this.heading.textContent())?.trim() ?? '';
    }

    async getProductsCount(): Promise<number> {
        return this.readCountAt(0);
    }

    async getExchangesCount(): Promise<number> {
        return this.readCountAt(1);
    }

    async openTab(tab: TProfileTab): Promise<void> {
        await this.page.getByRole('button', { name: new RegExp(`^${tab}: \\d+$`) }).click();
    }

    async clickAddProduct(): Promise<void> {
        await this.addProductButton.click();
    }

    async logout(): Promise<void> {
        await this.logoutButton.click();
    }

    productRow(title: string): Locator {
        return this.page.getByText(title, { exact: true });
    }

    private async readCountAt(spanIndex: number): Promise<number> {
        const span = this.statsBlock.locator('span').nth(spanIndex);
        if ((await span.count()) === 0) {
            return 0;
        }
        const text = await span.locator('b').textContent();
        return Number(text?.trim() ?? '0');
    }
}
