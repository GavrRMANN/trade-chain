import type { Locator } from '@playwright/test';

import { waitForUrlToMatch } from '../utils/waits';
import { BasePage } from './BasePage';

export type TProductFormInput = {
    title: string;
    categoryName: string;
    description: string;
    price: string;
    location: string;
    targetCategoryName: string;
};

/**
 * Форма создания товара, `entities/product/TargetProductPicker` + `CategoryPicker`
 * (features/productForm), маршрут `/create`.
 */
export class CreateProductPage extends BasePage {
    private readonly titleInput: Locator = this.page.getByLabel('Название');
    private readonly categorySearchInput: Locator = this.page.getByPlaceholder('Поиск категории');
    private readonly descriptionInput: Locator = this.page.getByLabel('Описание');
    private readonly priceInput: Locator = this.page.getByLabel('Цена, ₽');
    private readonly locationInput: Locator = this.page.getByLabel('Город');
    private readonly targetByCategoryTab: Locator = this.page.getByRole('button', { name: 'По категории' });
    private readonly targetCategorySelect: Locator = this.page
        .locator('label', { hasText: 'Категория цели' })
        .getByRole('combobox');
    private readonly submitButton: Locator = this.page.getByRole('button', {
        name: 'Опубликовать объявление',
    });

    async open(): Promise<void> {
        await this.goto('/create');
        await this.titleInput.waitFor({ state: 'visible' });
    }

    async fillTitle(title: string): Promise<void> {
        await this.titleInput.fill(title);
    }

    /** Ищет категорию по названию и выбирает первый результат поиска. */
    async selectCategory(categoryName: string): Promise<void> {
        await this.categorySearchInput.fill(categoryName);
        await this.page.getByRole('button', { name: categoryName, exact: true }).click();
    }

    async fillDescription(description: string): Promise<void> {
        await this.descriptionInput.fill(description);
    }

    async fillPrice(price: string): Promise<void> {
        await this.priceInput.fill(price);
    }

    async fillLocation(location: string): Promise<void> {
        await this.locationInput.fill(location);
    }

    /** Выбирает «Куда хотим прийти» через категорию — обязательное поле при создании. */
    async selectTargetCategory(categoryName: string): Promise<void> {
        await this.targetByCategoryTab.click();
        await this.targetCategorySelect.click();
        await this.page.getByRole('option', { name: categoryName, exact: true }).click();
        await this.page
            .getByRole('button', { name: new RegExp(`^Хочу из категории:\\s*${categoryName}$`) })
            .click();
    }

    async submit(): Promise<void> {
        await this.submitButton.click();
    }

    /**
     * Заполняет форму и публикует объявление. Успешное создание уводит на `/route`
     * с id нового товара в query-параметре `from` — оттуда и берём id для проверок.
     */
    async createProduct(data: TProductFormInput): Promise<string> {
        await this.fillTitle(data.title);
        await this.selectCategory(data.categoryName);
        await this.fillDescription(data.description);
        await this.fillPrice(data.price);
        await this.fillLocation(data.location);
        await this.selectTargetCategory(data.targetCategoryName);
        await this.submit();
        await waitForUrlToMatch(this.page, /\/route\?/);

        const productId = new URL(this.page.url()).searchParams.get('from');
        if (!productId) {
            throw new Error('Не удалось получить id созданного товара из URL перехода на /route');
        }
        return productId;
    }
}
