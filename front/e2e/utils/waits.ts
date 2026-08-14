import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Общие ожидания, переиспользуемые разными page object'ами. Вынесены
 * отдельно, чтобы страницы не дублировали одни и те же таймауты/условия
 * и чтобы таймауты подкручивались в одном месте.
 */

const MODAL_TIMEOUT = 10_000;
const NAVIGATION_TIMEOUT = 15_000;

/** Ждёт открытия модалки (route-модалки монтируются асинхронно) и возвращает её локатор. */
export const waitForModalOpen = async (
    page: Page,
    titleText: string | RegExp,
): Promise<Locator> => {
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: MODAL_TIMEOUT });
    await expect(dialog.getByRole('heading', { name: titleText })).toBeVisible({
        timeout: MODAL_TIMEOUT,
    });
    return dialog;
};

/** Ждёт, пока модалка закроется — обычно после успешной отправки формы. */
export const waitForModalClosed = async (page: Page): Promise<void> => {
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: MODAL_TIMEOUT });
};

/** Ждёт, пока URL перестанет содержать указанный фрагмент пути (переход после успешного действия). */
export const waitForUrlToLeave = async (page: Page, pathFragment: string): Promise<void> => {
    await page.waitForURL((url) => !url.pathname.includes(pathFragment), {
        timeout: NAVIGATION_TIMEOUT,
    });
};

/** Ждёт, пока URL начнёт соответствовать шаблону (переход на целевую страницу после действия). */
export const waitForUrlToMatch = async (page: Page, pattern: RegExp): Promise<void> => {
    await page.waitForURL(pattern, { timeout: NAVIGATION_TIMEOUT });
};

/** Ждёт, пока локатор с текстом ошибки исчезнет/не появится — для проверки, что запрос прошёл без ошибки. */
export const expectNoVisibleError = async (errorLocator: Locator): Promise<void> => {
    await expect(errorLocator).toHaveCount(0);
};
