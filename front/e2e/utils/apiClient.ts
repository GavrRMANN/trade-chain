import type { APIRequestContext } from '@playwright/test';

/**
 * Тонкий клиент к реальному backend API для подготовки данных теста
 * (регистрация, создание товаров) — используется вместо моков: тестовая
 * БД настоящая (см. docker-compose.test.yml), и сид идёт через тот же
 * API, которым пользуется приложение.
 */

const apiBaseUrl = process.env.E2E_API_BASE_URL ?? 'http://localhost:8081';
const apiPrefix = `${apiBaseUrl}/api/v1`;

export type TApiCustomer = {
    customer_id: string;
    email: string;
    full_name?: string;
};

export type TAuthSession = {
    token: string;
    customer: TApiCustomer;
};

export type TApiCategory = {
    category_id: string;
    name: string;
    parent_id?: string | null;
};

export type TCreateProductPayload = {
    customer_id: string;
    category_id: string;
    title: string;
    description?: string;
    image?: string;
    price?: number;
    location?: string;
};

export type TApiProduct = {
    product_id: string;
    customer_id: string;
    category_id: string;
    title: string;
    status: string;
};

export class ApiClient {
    constructor(private readonly request: APIRequestContext) {}

    async register(email: string, password: string): Promise<TAuthSession> {
        const response = await this.request.post(`${apiPrefix}/auth/register`, {
            data: { email, password },
        });
        await this.assertOk(response, `зарегистрировать пользователя ${email}`);
        const body = await response.json();
        return { token: body.token, customer: body.user };
    }

    async login(email: string, password: string): Promise<TAuthSession> {
        const response = await this.request.post(`${apiPrefix}/auth/login`, {
            data: { email, password },
        });
        await this.assertOk(response, `войти как ${email}`);
        const body = await response.json();
        return { token: body.token, customer: body.user };
    }

    async listCategories(): Promise<TApiCategory[]> {
        const response = await this.request.get(`${apiPrefix}/categories`);
        await this.assertOk(response, 'получить список категорий');
        return response.json();
    }

    async findCategoryByName(name: string): Promise<TApiCategory> {
        const categories = await this.listCategories();
        const found = categories.find((category) => category.name === name);
        if (!found) {
            throw new Error(`Категория «${name}» не найдена в тестовой БД`);
        }
        return found;
    }

    async createProduct(token: string, payload: TCreateProductPayload): Promise<TApiProduct> {
        const response = await this.request.post(`${apiPrefix}/products`, {
            headers: { Authorization: `Bearer ${token}` },
            data: payload,
        });
        await this.assertOk(response, `создать товар «${payload.title}»`);
        return response.json();
    }

    private async assertOk(
        response: { ok(): boolean; status(): number; text(): Promise<string> },
        action: string,
    ): Promise<void> {
        if (!response.ok()) {
            const body = await response.text();
            throw new Error(`Не удалось ${action}: ${response.status()} ${body}`);
        }
    }
}
