import { expect, type Locator } from '@playwright/test';

import { BasePage } from './BasePage';

const STATUS_WAIT_TIMEOUT = 15_000;

/** Комната сделки, маршрут `/exchanges/:chainId` (pages/exchangeRoom/ExchangeRoomPage). */
export class ExchangeRoomPage extends BasePage {
    private readonly actionsSection: Locator = this.page.locator(
        'section[aria-label="Действия по сделке"]',
    );
    private readonly acceptButton: Locator = this.page.getByRole('button', { name: 'Принять' });
    private readonly declineButton: Locator = this.page.getByRole('button', { name: 'Отклонить' });
    private readonly cancelButton: Locator = this.page.getByRole('button', {
        name: 'Отменить предложение',
    });
    private readonly confirmSuccessButton: Locator = this.page.getByRole('button', {
        name: 'Обмен состоялся',
    });
    private readonly confirmFailedButton: Locator = this.page.getByRole('button', {
        name: 'Не договорились',
    });
    private readonly commentInput: Locator = this.page.getByLabel('Комментарий');
    private readonly submitReviewButton: Locator = this.page.getByRole('button', {
        name: 'Отправить отзыв',
    });

    async open(chainId: string): Promise<void> {
        await this.goto(`/exchanges/${chainId}`);
        await this.actionsSection.waitFor({ state: 'visible' });
    }

    /** Ждёт, пока плашка статуса сделки (ChainStatusBadge) покажет нужный текст. */
    async waitForStatusLabel(label: string): Promise<void> {
        await expect(this.page.getByText(label, { exact: true })).toBeVisible({
            timeout: STATUS_WAIT_TIMEOUT,
        });
    }

    async accept(): Promise<void> {
        await this.acceptButton.click();
    }

    async decline(): Promise<void> {
        await this.declineButton.click();
    }

    async cancelOffer(): Promise<void> {
        await this.cancelButton.click();
    }

    async confirmExchangeSucceeded(): Promise<void> {
        await this.confirmSuccessButton.click();
    }

    async confirmExchangeFailed(): Promise<void> {
        await this.confirmFailedButton.click();
    }

    async isWaitingForOtherConfirmation(): Promise<boolean> {
        return this.page.getByText('Ожидаем подтверждение второй стороны').isVisible();
    }

    async leaveReview(rating: number, comment: string): Promise<void> {
        await this.page.getByRole('button', { name: `${rating} из 5` }).click();
        await this.commentInput.fill(comment);
        await this.submitReviewButton.click();
    }

    async isReviewSentVisible(): Promise<boolean> {
        return this.page.getByText('Спасибо за отзыв').isVisible();
    }
}
