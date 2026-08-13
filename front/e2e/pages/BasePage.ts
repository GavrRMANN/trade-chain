import type { Page } from '@playwright/test';

/** Общий предок для всех page object'ов: держит `page` и то, что нужно каждому наследнику. */
export abstract class BasePage {
    constructor(protected readonly page: Page) {}

    async goto(path: string): Promise<void> {
        await this.page.goto(path);
    }
}
