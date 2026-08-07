import { createServer } from 'node:http';
import { categories, products } from './data.js';

const port = Number(process.env.PORT || 3001);
const defaultPage = 1;
const defaultLimit = 20;
const maxLimit = 100;

const server = createServer((request, response) => {
    setCorsHeaders(response);

    if (request.method === 'OPTIONS') {
        response.writeHead(204);
        response.end();
        return;
    }

    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

    if (url.pathname.startsWith('/api/v1/products')) {
        handleProducts(request, response, url);
        return;
    }

    if (url.pathname.startsWith('/api/v1/categories')) {
        handleCategories(request, response, url);
        return;
    }

    sendError(response, 404, 'not_found', 'Ресурс не найден');
});

function handleProducts(request, response, url) {
    if (request.method !== 'GET') {
        sendError(response, 405, 'method_not_allowed', 'Поддерживается только GET');
        return;
    }

    const parts = getResourceParts(url.pathname, '/api/v1/products');

    if (parts.length === 0) {
        sendProducts(response, url.searchParams);
        return;
    }

    const [productId, action] = parts;
    if (action === 'recommendations' && parts.length === 2) {
        sendRecommendations(response, productId);
        return;
    }

    if (parts.length === 1) {
        const product = products.find(({ product_id: id }) => id === productId);
        product ? sendJson(response, 200, product) : sendError(response, 404, 'not_found', 'Товар не найден');
        return;
    }

    sendError(response, 404, 'not_found', 'Товар не найден');
}

function handleCategories(request, response, url) {
    if (request.method !== 'GET') {
        sendError(response, 405, 'method_not_allowed', 'Поддерживается только GET');
        return;
    }

    const parts = getResourceParts(url.pathname, '/api/v1/categories');
    if (parts.length === 0) {
        sendJson(response, 200, categories);
        return;
    }

    if (parts.length === 1) {
        const category = categories.find(({ category_id: id }) => id === parts[0]);
        category ? sendJson(response, 200, category) : sendError(response, 404, 'not_found', 'Категория не найдена');
        return;
    }

    sendError(response, 404, 'not_found', 'Категория не найдена');
}

function sendProducts(response, searchParams) {
    const query = (searchParams.get('q') || '').trim().toLocaleLowerCase('ru-RU');
    const categoryId = (searchParams.get('category_id') || '').trim();
    const filtered = products.filter((product) => {
        const matchesQuery = !query || [product.name, product.description]
            .some((value) => value.toLocaleLowerCase('ru-RU').includes(query));
        return matchesQuery && (!categoryId || product.category_id === categoryId);
    });

    const page = positiveInt(searchParams.get('page'), defaultPage);
    const limit = Math.min(positiveInt(searchParams.get('limit'), defaultLimit), maxLimit);
    const start = Math.min((page - 1) * limit, filtered.length);
    const items = filtered.slice(start, start + limit);

    sendJson(response, 200, {
        items,
        page,
        limit,
        total: filtered.length,
        total_pages: filtered.length ? Math.ceil(filtered.length / limit) : 0,
    });
}

function sendRecommendations(response, productId) {
    const product = products.find(({ product_id: id }) => id === productId);
    if (!product) {
        sendError(response, 404, 'not_found', 'Товар не найден');
        return;
    }

    sendJson(response, 200, products.filter((candidate) => (
        candidate.product_id !== productId && candidate.category_id !== product.category_id
    )));
}

function getResourceParts(pathname, prefix) {
    return pathname.slice(prefix.length).split('/').filter(Boolean);
}

function positiveInt(value, fallback) {
    const parsed = Number.parseInt(value || '', 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function setCorsHeaders(response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
}

function sendJson(response, status, body) {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(body));
}

function sendError(response, status, code, message) {
    sendJson(response, status, { error: { code, message } });
}

server.listen(port, () => {
    console.log(`Mock API слушает http://localhost:${port}`);
});
