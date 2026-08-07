/* global URL, console, process */

import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { categories, products } from './data.js';

const port = Number(process.env.PORT || 3001);
const defaultLimit = 20;

const server = createServer(async (request, response) => {
    setCorsHeaders(response);

    if (request.method === 'OPTIONS') {
        response.writeHead(204);
        response.end();
        return;
    }

    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

    if (url.pathname === '/health' && request.method === 'GET') {
        sendJson(response, 200, { status: 'ok' });
        return;
    }

    if (url.pathname === '/api/v1/auth/login' && request.method === 'POST') {
        sendJson(response, 200, { token: 'mock-token' });
        return;
    }

    if (url.pathname.startsWith('/api/v1/products')) {
        await handleProducts(request, response, url);
        return;
    }

    if (url.pathname.startsWith('/api/v1/categories')) {
        await handleCategories(request, response, url);
        return;
    }

    sendError(response, 404, 'Ресурс не найден');
});

async function handleProducts(request, response, url) {
    const parts = getResourceParts(url.pathname, '/api/v1/products');

    if (request.method === 'POST' && parts.length === 0) {
        await handleProductCreate(request, response);
        return;
    }

    if (request.method === 'GET' && parts.length === 0) {
        sendProducts(response, url.searchParams);
        return;
    }

    if (request.method === 'GET' && parts[0] === 'search' && parts.length === 1) {
        sendProductSearch(response, url.searchParams);
        return;
    }

    if (request.method === 'GET' && parts[0] === 'by-customer' && parts.length === 2) {
        sendJson(response, 200, activeProducts().filter(({ customer_id: customerId }) => customerId === parts[1]));
        return;
    }

    if (parts.length !== 1) {
        sendError(response, 404, 'Товар не найден');
        return;
    }

    const productId = parts[0];
    const productIndex = products.findIndex(({ product_id: id }) => id === productId);
    const product = productIndex >= 0 ? products[productIndex] : undefined;

    if (request.method === 'GET') {
        if (product && product.is_active) {
            sendJson(response, 200, product);
        } else {
            sendError(response, 404, 'Товар не найден');
        }
        return;
    }

    if (request.method === 'POST') {
        sendError(response, 405, 'Метод не поддерживается');
        return;
    }

    if (productIndex < 0) {
        sendError(response, 404, 'Товар не найден');
        return;
    }

    if (request.method === 'PATCH') {
        const body = await readJson(request);
        if (!body || typeof body !== 'object') {
            sendError(response, 400, 'Некорректное тело запроса');
            return;
        }
        products[productIndex] = {
            ...products[productIndex],
            ...(body.name !== undefined ? { name: body.name } : {}),
            ...(body.description !== undefined ? { description: body.description } : {}),
            ...(body.category_id !== undefined ? { category_id: body.category_id } : {}),
            ...(body.is_active !== undefined ? { is_active: body.is_active } : {}),
            updated_at: new Date().toISOString(),
        };
        sendJson(response, 200, products[productIndex]);
        return;
    }

    if (request.method === 'DELETE') {
        products[productIndex].is_active = false;
        products[productIndex].updated_at = new Date().toISOString();
        response.writeHead(204);
        response.end();
        return;
    }

    sendError(response, 405, 'Метод не поддерживается');
}

async function handleCategories(request, response, url) {
    const parts = getResourceParts(url.pathname, '/api/v1/categories');

    if (request.method === 'POST' && parts.length === 0) {
        const body = await readJson(request);
        if (!body || typeof body !== 'object' || !body.name) {
            sendError(response, 400, 'Некорректное тело запроса');
            return;
        }
        const now = new Date().toISOString();
        const category = {
            category_id: randomUUID(),
            name: body.name,
            ...(body.parent_id ? { parent_id: body.parent_id } : {}),
            created_at: now,
            updated_at: now,
        };
        categories.push(category);
        sendJson(response, 201, category);
        return;
    }

    if (request.method === 'GET' && parts.length === 0) {
        sendJson(response, 200, categories);
        return;
    }

    if (request.method === 'GET' && parts.length === 2 && parts[1] === 'subcategories') {
        sendJson(response, 200, categories.filter(({ parent_id: parentId }) => parentId === parts[0]));
        return;
    }

    if (parts.length !== 1) {
        sendError(response, 404, 'Категория не найдена');
        return;
    }

    const categoryId = parts[0];
    const categoryIndex = categories.findIndex(({ category_id: id }) => id === categoryId);

    if (request.method === 'GET') {
        if (categoryIndex >= 0) {
            sendJson(response, 200, categories[categoryIndex]);
        } else {
            sendError(response, 404, 'Категория не найдена');
        }
        return;
    }

    if (categoryIndex < 0) {
        sendError(response, 404, 'Категория не найдена');
        return;
    }

    if (request.method === 'PUT') {
        const body = await readJson(request);
        if (!body || typeof body !== 'object' || !body.name) {
            sendError(response, 400, 'Некорректное тело запроса');
            return;
        }
        categories[categoryIndex] = {
            ...categories[categoryIndex],
            name: body.name,
            ...(body.parent_id !== undefined ? { parent_id: body.parent_id } : {}),
            updated_at: new Date().toISOString(),
        };
        sendJson(response, 200, categories[categoryIndex]);
        return;
    }

    if (request.method === 'DELETE') {
        categories.splice(categoryIndex, 1);
        response.writeHead(204);
        response.end();
        return;
    }

    sendError(response, 405, 'Метод не поддерживается');
}

async function handleProductCreate(request, response) {
    const body = await readJson(request);
    if (!body || typeof body !== 'object' || !body.customer_id || !body.name) {
        sendError(response, 400, 'Некорректное тело запроса');
        return;
    }

    const now = new Date().toISOString();
    const product = {
        product_id: randomUUID(),
        customer_id: body.customer_id,
        ...(body.category_id ? { category_id: body.category_id } : {}),
        name: body.name,
        ...(body.description ? { description: body.description } : {}),
        is_active: true,
        created_at: now,
        updated_at: now,
    };
    products.unshift(product);
    sendJson(response, 201, product);
}

function sendProducts(response, searchParams) {
    const offset = nonNegativeInt(searchParams.get('offset'), 0);
    const limit = positiveInt(searchParams.get('limit'), defaultLimit);
    sendJson(response, 200, activeProducts().slice(offset, offset + limit));
}

function sendProductSearch(response, searchParams) {
    const query = (searchParams.get('q') || '').trim().toLocaleLowerCase('ru-RU');
    const categoryId = (searchParams.get('category_id') || '').trim();
    if (!query && !categoryId) {
        sendError(response, 400, 'Некорректный поисковый запрос');
        return;
    }
    sendJson(response, 200, activeProducts().filter((product) => {
        const matchesQuery = !query || [product.name, product.description]
            .some((value) => value.toLocaleLowerCase('ru-RU').includes(query));
        return matchesQuery && (!categoryId || product.category_id === categoryId);
    }));
}

function activeProducts() {
    return products.filter(({ is_active: isActive }) => isActive);
}

function getResourceParts(pathname, prefix) {
    return pathname.slice(prefix.length).split('/').filter(Boolean);
}

function positiveInt(value, fallback) {
    const parsed = Number.parseInt(value || '', 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function nonNegativeInt(value, fallback) {
    const parsed = Number.parseInt(value || '', 10);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function readJson(request) {
    return new Promise((resolve) => {
        let body = '';
        request.setEncoding('utf8');
        request.on('data', (chunk) => { body += chunk; });
        request.on('end', () => {
            try { resolve(body ? JSON.parse(body) : undefined); } catch { resolve(undefined); }
        });
    });
}

function setCorsHeaders(response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.setHeader('Access-Control-Allow-Methods', 'DELETE, GET, OPTIONS, PATCH, POST, PUT');
}

function sendJson(response, status, body) {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(body));
}

function sendError(response, status, message) {
    sendJson(response, status, { error: message });
}

server.listen(port, () => {
    console.log(`Mock API слушает http://localhost:${port}`);
});
