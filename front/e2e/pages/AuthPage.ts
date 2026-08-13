import type { Locator } from '@playwright/test';

import { waitForUrlToLeave } from '../utils/waits';
import { BasePage } from './BasePage';

/** Модалка входа/регистрации, маршрут `/auth` (features/auth/AuthForm → PasswordForm). */
export class AuthPage extends BasePage {
    private readonly emailInput: Locator = this.page.getByLabel('Email');
    private readonly passwordInput: Locator = this.page.getByLabel('Пароль', { exact: true });
    private readonly confirmPasswordInput: Locator = this.page.getByLabel('Повторите пароль');
    private readonly switchModeButton: Locator = this.page.getByRole('button', {
        name: /Создать аккаунт|Уже есть аккаунт\? Войти/,
    });
    private readonly loginSubmitButton: Locator = this.page.getByRole('button', { name: 'Войти', exact: true });
    private readonly registerSubmitButton: Locator = this.page.getByRole('button', {
        name: 'Зарегистрироваться',
    });

    async open(): Promise<void> {
        await this.goto('/auth');
        await this.emailInput.waitFor({ state: 'visible' });
    }

    async switchToRegisterMode(): Promise<void> {
        const isAlreadyRegisterMode = await this.registerSubmitButton.isVisible().catch(() => false);
        if (!isAlreadyRegisterMode) {
            await this.switchModeButton.click();
            await this.confirmPasswordInput.waitFor({ state: 'visible' });
        }
    }

    async register(email: string, password: string): Promise<void> {
        await this.switchToRegisterMode();
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.confirmPasswordInput.fill(password);
        await this.registerSubmitButton.click();
        await waitForUrlToLeave(this.page, '/auth');
    }

    async login(email: string, password: string): Promise<void> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginSubmitButton.click();
        await waitForUrlToLeave(this.page, '/auth');
    }
}
