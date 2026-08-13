// Mock-API, воспроизводящий контракты бэкенда trade-chain 1-в-1:
// пути, методы, тела запросов/ответов, статусы и бизнес-логику FSM обмена
// (back/internal/httpapi, back/internal/exchange, back/internal/service).
//
// Токен авторизации имеет фиксированный формат `mock-token:<customer_id>`;
// идентификатор пользователя достаётся из него так же, как бэкенд достаёт его
// из контекста после auth.AuthMiddleware.

import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import {
    categories,
    customers,
    products,
    chains,
    chainMessages,
    confirmations,
    reviews,
    wishlists,
    wishlistOptions,
    customerRecommendations,
} from './data.js';

const port = Number(process.env.PORT || 3001);
const defaultLimit = 20;

// Срок жизни предложения — как в exchange.DefaultTTL (72 часа).
const offerTtlMs = 72 * 60 * 60 * 1000;

const server = createServer(async (request, response) => {
    setCorsHeaders(response);

    if (request.method === 'OPTIONS') {
        response.writeHead(204);
        response.end();
        return;
    }

    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    try {
        if (url.pathname === '/health' && request.method === 'GET') {
            return sendJson(response, 200, { status: 'ok' });
        }
        if (url.pathname === '/api/v1/auth/login' && request.method === 'POST')
            return login(request, response);
        if (url.pathname === '/api/v1/auth/register' && request.method === 'POST')
            return register(request, response);
        if (url.pathname === '/api/v1/auth/demo-login' && request.method === 'POST')
            return demoLogin(request, response);
        if (url.pathname === '/api/v1/auth/me' && request.method === 'GET')
            return currentUser(request, response);
        if (url.pathname === '/api/v1/events' && request.method === 'GET')
            return streamEvents(request, response);
        if (url.pathname.startsWith('/api/v1/notifications'))
            return handleNotifications(request, response, url);

        // exchange-offers/exchanges объявляются раньше общих префиксов, чтобы
        // специфичные пути не ушли в обработчики chains/products.
        if (url.pathname.startsWith('/api/v1/exchange-offers'))
            return handleExchangeOffers(request, response, url);
        if (url.pathname.startsWith('/api/v1/exchanges'))
            return handleExchanges(request, response, url);

        if (url.pathname.startsWith('/api/v1/products'))
            return handleProducts(request, response, url);
        if (url.pathname.startsWith('/api/v1/categories'))
            return handleCategories(request, response, url);
        if (url.pathname.startsWith('/api/v1/customers'))
            return handleCustomers(request, response, url);
        if (url.pathname.startsWith('/api/v1/chains')) return handleChains(request, response, url);
        if (url.pathname.startsWith('/api/v1/reviews'))
            return handleReviews(request, response, url);
        if (url.pathname.startsWith('/api/v1/wishlists'))
            return handleWishlists(request, response, url);
        if (url.pathname === '/api/v1/search/chain' && request.method === 'GET')
            return findChain(request, response, url.searchParams);
        if (url.pathname === '/api/v1/search/candidates' && request.method === 'GET')
            return findCandidates(request, response, url.searchParams);
        return sendError(response, 404, 'Ресурс не найден');
    } catch (error) {
        console.error(error);
        return sendError(response, 500, 'Внутренняя ошибка мок-API');
    }
});

// ===== Авторизация =========================================================

async function login(request, response) {
    const body = await readJson(request);
    const customer = customers.find(
        (item) => item.email === body?.email && item.password === body?.password && item.is_active,
    );
    if (!customer) return sendError(response, 400, 'Неверный email или пароль');
    return sendJson(response, 200, {
        token: `mock-token:${customer.customer_id}`,
        user: publicCustomer(customer),
    });
}

async function register(request, response) {
    const body = await readJson(request);
    if (!body?.email || !body?.password)
        return sendError(response, 400, 'Некорректное тело запроса');
    if (customers.some((item) => item.email === body.email))
        return sendError(response, 409, 'Пользователь уже существует');
    const customer = makeCustomer(body.email, body.password, body.full_name);
    customers.push(customer);
    return sendJson(response, 201, {
        token: `mock-token:${customer.customer_id}`,
        user: publicCustomer(customer),
    });
}

// demoLogin повторяет httpapi.authHandler.demoLogin: вход по выбору участника
// без пароля. В mock флаг DEMO_LOGIN_ENABLED всегда считается включённым —
// сам mock-API и существует ради демонстрации.
async function demoLogin(request, response) {
    const body = await readJson(request);
    /* Витрина `/demo` присылает идентификатор профиля из 013_demo_accounts.sql,
       а mock хранит участников под своими читаемыми ключами — вход принимает
       оба, иначе демонстрационные кнопки упирались бы в «Пользователь не
       найден». */
    const customer = customers.find(
        (item) =>
            (item.customer_id === body?.customer_id ||
                item.demo_customer_id === body?.customer_id) &&
            item.is_active,
    );
    if (!customer) return sendError(response, 404, 'Пользователь не найден');
    return sendJson(response, 200, {
        token: `mock-token:${customer.customer_id}`,
        user: publicCustomer(customer),
    });
}

function currentUser(request, response) {
    const user = requireUser(request);
    if (!user) return sendError(response, 403, 'operation forbidden');
    return sendJson(response, 200, publicCustomer(user.customer));
}

// requireUser эмулирует auth.AuthMiddleware + auth.UserIDFromContext: без
// валидного mock-токена защищённый эндпоинт не выполняется.
function requireUser(request) {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    const customerId = token?.startsWith('mock-token:') ? token.slice('mock-token:'.length) : '';
    const customer = customers.find((item) => item.customer_id === customerId && item.is_active);
    return customer ? { id: customer.customer_id, customer } : null;
}

// ===== Customers ===========================================================

async function handleCustomers(request, response, url) {
    const parts = getResourceParts(url.pathname, '/api/v1/customers');
    // overview проверяется раньше разбора {id}: иначе слово уедет в поиск
    // пользователя по идентификатору и вернёт 404.
    if (request.method === 'GET' && parts.length === 1 && parts[0] === 'overview') {
        return sendJson(
            response,
            200,
            activeCustomers()
                .slice(...sliceBounds(url.searchParams))
                .map(customerOverview),
        );
    }
    // Рекомендации текущего пользователя проверяются раньше {id}: иначе 'me'
    // уедет в поиск клиента по идентификатору и вернёт 404.
    if (parts.length >= 2 && parts[0] === 'me' && parts[1] === 'recommendations') {
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');

        if (request.method === 'GET' && parts.length === 2)
            return sendJson(response, 200, customerRecommendationList(user.id));

        if (request.method === 'POST' && parts.length === 2) {
            const body = await readJson(request);
            for (const categoryId of body?.category_ids || []) addCustomerRecommendation(user.id, categoryId);
            return sendJson(response, 201, customerRecommendationList(user.id));
        }

        if (request.method === 'PATCH' && parts.length === 2) {
            const body = await readJson(request);
            customerRecommendations[user.id] = [...new Set(body?.category_ids || [])];
            return sendJson(response, 200, customerRecommendationList(user.id));
        }

        if (request.method === 'DELETE' && parts.length === 3) {
            customerRecommendations[user.id] = (customerRecommendations[user.id] || []).filter(
                (categoryId) => categoryId !== parts[2],
            );
            response.writeHead(204);
            return response.end();
        }

        return sendError(response, 405, 'Метод не поддерживается');
    }

    if (request.method === 'GET' && parts.length === 2 && parts[1] === 'recommendations') {
        return sendJson(response, 200, customerRecommendationList(parts[0]));
    }

    // POST /customers на бэкенде не смонтирован — регистрация идёт через /auth/register.
    if (request.method === 'GET' && parts.length === 0) {
        return sendJson(
            response,
            200,
            activeCustomers()
                .slice(...sliceBounds(url.searchParams))
                .map(publicCustomer),
        );
    }
    if (parts.length !== 1) return sendError(response, 404, 'Пользователь не найден');
    const index = customers.findIndex(({ customer_id: id }) => id === parts[0]);
    if (index < 0 || !customers[index].is_active)
        return sendError(response, 404, 'Пользователь не найден');
    if (request.method === 'GET') return sendJson(response, 200, publicCustomer(customers[index]));
    if (request.method === 'PATCH') {
        const body = await readJson(request);
        if (!body || typeof body !== 'object')
            return sendError(response, 400, 'Некорректное тело запроса');
        if (body.email !== undefined) customers[index].email = body.email;
        if (body.password !== undefined) customers[index].password = body.password;
        if (body.full_name !== undefined) customers[index].full_name = body.full_name;
        customers[index].updated_at = new Date().toISOString();
        return sendJson(response, 200, publicCustomer(customers[index]));
    }
    if (request.method === 'DELETE') {
        customers[index].is_active = false;
        customers[index].updated_at = new Date().toISOString();
        response.writeHead(204);
        return response.end();
    }
    return sendError(response, 405, 'Метод не поддерживается');
}

// ===== Products ============================================================

async function handleProducts(request, response, url) {
    const parts = getResourceParts(url.pathname, '/api/v1/products');

    if (request.method === 'GET' && parts.length === 0) {
        const query = url.searchParams.get('q') || '';
        const categoryId = url.searchParams.get('category_id') || '';
        const hasSearch = query.trim() || categoryId.trim();
        const list = hasSearch
            ? findProducts(query, categoryId)
            : activeProducts().sort(sortByDateDesc);
        const feed = withDirectMatch(list, requireUser(request)?.id);
        return sendJson(response, 200, feed.slice(...sliceBounds(url.searchParams)));
    }

    if (request.method === 'GET' && parts.length === 2 && parts[1] === 'recommendations') {
        return productRecommendations(request, response, parts[0]);
    }

    /* mine и by-customer различаются архивом — так же, как на бэкенде:
       GetOwnByCustomerID отдаёт владельцу весь его список вместе с архивом,
       а GetByCustomerID (WHERE status != 'archived') — только то, что ещё
       участвует в обменах. */
    if (request.method === 'GET' && parts.length === 1 && parts[0] === 'mine') {
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        return sendJson(
            response,
            200,
            products.filter((product) => product.customer_id === user.id),
        );
    }

    if (request.method === 'GET' && parts.length === 2 && parts[0] === 'by-customer') {
        const customerId = parts[1];
        const user = requireUser(request);
        if (!user || user.id !== customerId) return sendError(response, 403, 'operation forbidden');
        return sendJson(
            response,
            200,
            products.filter(
                (product) =>
                    product.customer_id === customerId && product.status !== 'archived',
            ),
        );
    }

    if (parts.length === 2 && parts[1] === 'image') {
        const index = products.findIndex(({ product_id: id }) => id === parts[0]);
        if (index < 0 || products[index].status === 'archived')
            return sendError(response, 404, 'Товар не найден');
        if (request.method !== 'POST') return sendError(response, 405, 'Метод не поддерживается');
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        if (products[index].customer_id !== user.id)
            return sendError(response, 403, 'operation forbidden');
        // Загрузка файла в mock не сохраняется на диск: эмулируем успех и
        // проставляем фиктивный URL, как если бы файл лёг в ./uploads.
        const ext = guessImageExt(request.headers['content-type'] || '');
        products[index].image = `/uploads/${randomUUID()}${ext}`;
        products[index].updated_at = new Date().toISOString();
        return sendJson(response, 200, products[index]);
    }

    // archive повторяет productHandler.delete: мягкое удаление владельцем,
    // после которого товар выпадает из каталога и новых обменов.
    if (parts.length === 2 && parts[1] === 'archive') {
        if (request.method !== 'POST') return sendError(response, 405, 'Метод не поддерживается');
        const index = products.findIndex(({ product_id: id }) => id === parts[0]);
        if (index < 0 || products[index].status === 'archived')
            return sendError(response, 404, 'Товар не найден');
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        if (products[index].customer_id !== user.id)
            return sendError(response, 403, 'operation forbidden');
        products[index].status = 'archived';
        products[index].updated_at = new Date().toISOString();
        response.writeHead(204);
        return response.end();
    }

    if (request.method === 'POST' && parts.length === 0) {
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        const body = await readJson(request);
        if (!body?.customer_id || !body?.title)
            return sendError(response, 400, 'Некорректное тело запроса');
        const product = makeProduct(body);
        products.unshift(product);
        return sendJson(response, 201, product);
    }

    if (parts.length !== 1) return sendError(response, 404, 'Товар не найден');
    const index = products.findIndex(({ product_id: id }) => id === parts[0]);
    if (index < 0) return sendError(response, 404, 'Товар не найден');
    /* Карточку архивного товара бэкенд отдаёт (productRepository.GetByID не
       фильтрует по статусу) — на неё ведут ссылки из истории обменов, и фронт
       показывает её отдельным архивным видом. Скрыт архив только из списков. */
    if (request.method === 'GET') return sendJson(response, 200, products[index]);
    if (products[index].status === 'archived')
        return sendError(response, 404, 'Товар не найден');
    if (request.method === 'PATCH') {
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        const body = await readJson(request);
        if (!body || typeof body !== 'object')
            return sendError(response, 400, 'Некорректное тело запроса');
        products[index] = {
            ...products[index],
            ...pick(body, [
                'title',
                'description',
                'category_id',
                'image',
                'price',
                'location',
                'status',
            ]),
            updated_at: new Date().toISOString(),
        };
        return sendJson(response, 200, products[index]);
    }
    // DELETE для products на бэкенде не зарегистрирован — здесь его нет.
    return sendError(response, 405, 'Метод не поддерживается');
}

/**
 * Ищет объявления тем же контрактом, что и backend ProductService.Search.
 * В mock используется детерминированный скоринг вместо PostgreSQL FTS и pg_trgm.
 */
function findProducts(query, categoryId) {
    const normalizedQuery = normalizeSearchText(query);
    const words = getSearchTerms(normalizedQuery);

    return activeProducts()
        .filter((product) => !categoryId || product.category_id === categoryId)
        .map((product) => ({ product, score: getSearchScore(product, normalizedQuery, words) }))
        .filter(({ score }) => !normalizedQuery || score > 0)
        .sort(
            (left, right) =>
                right.score - left.score || sortByDateDesc(left.product, right.product),
        )
        .map(({ product }) => product);
}

function getSearchScore(product, query, words) {
    if (!query) return 0;

    const title = normalizeSearchText(product.title);
    const description = normalizeSearchText(product.description);
    const category = normalizeSearchText(
        categories.find(({ category_id: id }) => id === product.category_id)?.name,
    );
    const fullText = `${title} ${description} ${category}`;
    const titleSimilarity = trigramSimilarity(title, query);
    const descriptionSimilarity = trigramSimilarity(description, query);

    // Аналог WHERE из product_repository.go:
    // search_vector @@ tsquery OR title % query OR description % query.
    const matchesSearchVector = words.length > 0 && words.every((word) => fullText.includes(word));
    if (!matchesSearchVector && titleSimilarity < 0.3 && descriptionSimilarity < 0.3) return 0;

    // Аналог SELECT score из backend:
    // 0.60 * ts_rank_cd + 0.25 * similarity(title) + 0.15 * similarity(description).
    const textRank = getTextRank(words, title, description, category);
    return 0.6 * textRank + 0.25 * titleSimilarity + 0.15 * descriptionSimilarity;
}

function getSearchTerms(query) {
    return query
        .replace(/[-+&|!():*]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
}

function getTextRank(words, title, description, category) {
    if (!words.length) return 0;
    const weightedMatches = words.reduce((score, word) => {
        if (title.includes(word)) return score + 1;
        if (description.includes(word)) return score + 0.4;
        if (category.includes(word)) return score + 0.1;
        return score;
    }, 0);
    return weightedMatches / words.length;
}

function trigramSimilarity(left, right) {
    if (!left || !right) return 0;
    const leftTrigrams = getTrigrams(left);
    const rightTrigrams = getTrigrams(right);
    const shared = [...leftTrigrams].filter((trigram) => rightTrigrams.has(trigram)).length;
    return shared / Math.max(leftTrigrams.size, rightTrigrams.size);
}

function getTrigrams(value) {
    const normalized = `  ${value} `;
    const trigrams = new Set();
    for (let index = 0; index < normalized.length - 2; index += 1) {
        trigrams.add(normalized.slice(index, index + 3));
    }
    return trigrams;
}

function normalizeSearchText(value) {
    return String(value || '')
        .toLocaleLowerCase('ru-RU')
        .normalize('NFKC')
        .trim();
}

/**
 * Помечает карточки, владельцам которых подходит что-то из вещей зрителя,
 * и поднимает их наверх выдачи. Повторяет выражение matched_by_product_id
 * из productRepository.List (back/internal/repository/product_repository.go).
 */
function withDirectMatch(list, viewerId) {
    if (!viewerId) return list;

    const mine = products
        .filter((item) => item.customer_id === viewerId && item.status === 'active')
        .sort(sortByDateDesc);

    if (mine.length === 0) return list;

    const matched = list.map((product) => {
        if (product.customer_id === viewerId) return product;

        const wishlist = wishlists.find((item) => item.product_id === product.product_id);
        const wanted = wishlist ? wishlistOptions[wishlist.wishlist_id] || [] : [];
        const source = mine.find((item) => wanted.includes(item.category_id));

        return source
            ? { ...product, matched: true, matched_by_product_id: source.product_id }
            : product;
    });

    // Сортировка стабильна, поэтому внутри групп сохраняется исходный порядок
    // (релевантность поиска или дата публикации).
    return matched.sort((left, right) => Number(!!right.matched) - Number(!!left.matched));
}

function sortByDateDesc(left, right) {
    return (
        new Date(right.updated_at || right.created_at).getTime() -
        new Date(left.updated_at || left.created_at).getTime()
    );
}

// ===== Categories ==========================================================

async function handleCategories(request, response, url) {
    const parts = getResourceParts(url.pathname, '/api/v1/categories');
    if (request.method === 'GET' && parts.length === 0) return sendJson(response, 200, categories);
    if (request.method === 'POST' && parts.length === 0) {
        const body = await readJson(request);
        if (!body?.name) return sendError(response, 400, 'Некорректное тело запроса');
        const category = makeCategory(body);
        categories.push(category);
        return sendJson(response, 201, category);
    }
    if (request.method === 'GET' && parts.length === 2 && parts[1] === 'subcategories') {
        return sendJson(
            response,
            200,
            categories.filter((item) => item.parent_id === parts[0]),
        );
    }
    if (parts.length !== 1) return sendError(response, 404, 'Категория не найдена');
    const index = categories.findIndex(({ category_id: id }) => id === parts[0]);
    if (index < 0) return sendError(response, 404, 'Категория не найдена');
    if (request.method === 'GET') return sendJson(response, 200, categories[index]);
    if (request.method === 'PUT') {
        const body = await readJson(request);
        if (!body?.name) return sendError(response, 400, 'Некорректное тело запроса');
        categories[index] = {
            ...categories[index],
            name: body.name,
            ...(body.parent_id !== undefined ? { parent_id: body.parent_id } : {}),
            updated_at: new Date().toISOString(),
        };
        return sendJson(response, 200, categories[index]);
    }
    if (request.method === 'DELETE') {
        categories.splice(index, 1);
        response.writeHead(204);
        return response.end();
    }
    return sendError(response, 405, 'Метод не поддерживается');
}

// ===== Chains ==============================================================

async function handleChains(request, response, url) {
    const parts = getResourceParts(url.pathname, '/api/v1/chains');

    // Статичный сегмент /my объявляется раньше шаблона {id}.
    if (request.method === 'GET' && parts[0] === 'my' && parts.length === 1) {
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        return sendJson(
            response,
            200,
            chains.filter((item) => item.initiator_id === user.id || item.recipient_id === user.id),
        );
    }

    if (request.method === 'GET' && parts[0] === 'by-product' && parts.length === 2) {
        return sendJson(
            response,
            200,
            chains.filter(
                (item) => item.from_product_id === parts[1] || item.to_product_id === parts[1],
            ),
        );
    }

    if (request.method === 'POST' && parts.length === 0) {
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        const body = await readJson(request);
        try {
            const chain = createChain(user.id, body);
            chains.push(chain);
            publishChainEvent('exchange.offer.created', chain);
            return sendJson(response, 201, chain);
        } catch (error) {
            return sendChainError(response, error);
        }
    }

    const index = chains.findIndex(({ chain_id: id }) => id === parts[0]);
    if (index < 0) return sendError(response, 404, 'Цепочка не найдена');

    if (request.method === 'GET' && parts.length === 1)
        return sendJson(response, 200, chains[index]);
    if (request.method === 'GET' && parts.length === 2 && parts[1] === 'full') {
        return sendJson(response, 200, fullChain(chains[index]));
    }

    if (request.method === 'PATCH' && parts.length === 2 && parts[1] === 'status') {
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        const body = await readJson(request);
        if (!body?.status) return sendError(response, 400, 'Некорректное тело запроса');
        // PATCH /status переводит желаемый статус в действие стейт-машины.
        const action = statusAction(body.status);
        if (!action) return sendError(response, 400, 'Некорректное тело запроса');
        const error = applyAction(chains[index], action, user.id);
        if (error) return sendChainError(response, error);
        chains[index].updated_at = new Date().toISOString();
        publishChainEvent(
            chains[index].status === 'completed'
                ? 'exchange.completed'
                : 'exchange.chain.updated',
            chains[index],
        );
        response.writeHead(204);
        return response.end();
    }

    if (request.method === 'POST' && parts.length === 2 && parts[1] === 'confirm') {
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        const body = await readJson(request);
        if (!body || typeof body.success !== 'boolean')
            return sendError(response, 400, 'Некорректное тело запроса');
        const error = confirmChain(chains[index], user.id, body.success, body.reason || '');
        if (error) return sendChainError(response, error);
        publishChainEvent('exchange.confirmation.created', chains[index]);
        if (chains[index].status === 'completed') {
            publishChainEvent('exchange.completed', chains[index]);
        }
        return sendJson(response, 200, chains[index]);
    }

    if (request.method === 'GET' && parts.length === 2 && parts[1] === 'messages') {
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        if (!involves(chains[index], user.id))
            return sendError(response, 403, 'пользователь не участвует в этом обмене');
        return sendJson(response, 200, chainMessages[chains[index].chain_id] || []);
    }

    if (request.method === 'POST' && parts.length === 2 && parts[1] === 'messages') {
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        const body = await readJson(request);
        const text = String(body?.body || '').trim();
        if (!text) return sendError(response, 400, 'Некорректное тело запроса');
        const writeError = canWrite(chains[index], user.id);
        if (writeError) return sendChainError(response, writeError);
        const message = {
            message_id: randomUUID(),
            chain_id: chains[index].chain_id,
            customer_id: user.id,
            body: text,
            created_at: new Date().toISOString(),
        };
        (chainMessages[chains[index].chain_id] ||= []).push(message);
        publishChainEvent('exchange.message.created', chains[index]);
        return sendJson(response, 201, message);
    }

    if (request.method === 'DELETE' && parts.length === 1) {
        const [removed] = chains.splice(index, 1);
        publishChainEvent('exchange.chain.deleted', removed);
        response.writeHead(204);
        return response.end();
    }
    return sendError(response, 405, 'Метод не поддерживается');
}

// createChain воспроизводит chainService.Create: проверки товаров, recipient_id
// вычисляется из запрошенного товара, статус всегда pending, expires_at = now+TTL.
function createChain(initiatorId, body) {
    if (!body?.from_product_id || !body?.to_product_id) {
        throw mockError(400, 'Некорректное тело запроса');
    }

    const offered = products.find((item) => item.product_id === body.from_product_id);
    const requested = products.find((item) => item.product_id === body.to_product_id);
    if (!offered || !requested) throw mockError(404, 'Товар не найден');

    const recipientId = requested.customer_id;
    validateDeal(initiatorId, recipientId, offered, requested);
    validateSurcharge(initiatorId, recipientId, body.surcharge);

    if (hasOpenOffer(initiatorId, recipientId, body.from_product_id, body.to_product_id)) {
        throw mockError(409, 'предложение по этим товарам уже отправлено');
    }

    const now = new Date();
    return {
        chain_id: randomUUID(),
        from_product_id: body.from_product_id,
        to_product_id: body.to_product_id,
        initiator_id: initiatorId,
        recipient_id: recipientId,
        previous_chain_id: body.previous_chain_id || null,
        next_chain_id: body.next_chain_id || null,
        status: 'pending',
        message: body.message || '',
        exchange_goal_id: body.exchange_goal_id || null,
        route_step_id: body.route_step_id || null,
        surcharge: normalizeSurcharge(body.surcharge),
        expires_at: new Date(now.getTime() + offerTtlMs).toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
    };
}

// ===== Exchange-offers / Exchanges =========================================

async function handleExchangeOffers(request, response, url) {
    const parts = getResourceParts(url.pathname, '/api/v1/exchange-offers');

    if (request.method === 'POST' && parts.length === 0) {
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        const body = await readJson(request);
        try {
            const chain = createOffer(user.id, body);
            chains.push(chain);
            publishChainEvent('exchange.offer.created', chain);
            return sendJson(response, 201, {
                id: chain.chain_id,
                status: offerStatusOf(chain),
                conversation_id: chain.chain_id,
                expires_at: chain.expires_at,
            });
        } catch (error) {
            return sendChainError(response, error);
        }
    }

    if (request.method === 'GET' && parts.length === 0) {
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        const role = parseRole(url.searchParams.get('role'));
        if (role === null) return sendError(response, 400, 'Некорректное тело запроса');
        const statuses = parseStatuses(url.searchParams.getAll('status'));
        if (statuses === null) return sendError(response, 400, 'Некорректное тело запроса');

        const list = chains
            .filter((chain) => involves(chain, user.id))
            .filter((chain) => role === '' || offerRole(chain, user.id) === role)
            .filter((chain) => statuses.length === 0 || statuses.includes(offerStatusOf(chain)))
            .map((chain) => offerResponse(chain, user.id));
        return sendJson(response, 200, list);
    }

    if (parts.length === 1) {
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        const chain = chains.find((item) => item.chain_id === parts[0]);
        if (!chain) return sendError(response, 404, 'Цепочка не найдена');
        if (!involves(chain, user.id))
            return sendError(response, 403, 'пользователь не участвует в этом обмене');
        if (request.method === 'GET') {
            return sendJson(response, 200, {
                ...offerResponse(chain, user.id),
                messages: chainMessages[chain.chain_id] || [],
                confirmations: (confirmations[chain.chain_id] || []).map(confirmationResponse),
            });
        }
    }

    // accept / decline / cancel — общий вид запроса и ответа, разрешения решает FSM.
    if (
        parts.length === 2 &&
        ['accept', 'decline', 'cancel'].includes(parts[1]) &&
        request.method === 'POST'
    ) {
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        const chain = chains.find((item) => item.chain_id === parts[0]);
        if (!chain) return sendError(response, 404, 'Цепочка не найдена');
        const action = parts[1];
        const error = applyAction(chain, action, user.id);
        if (error) return sendChainError(response, error);
        chain.updated_at = new Date().toISOString();
        publishChainEvent(
            chain.status === 'completed' ? 'exchange.completed' : 'exchange.chain.updated',
            chain,
        );
        return sendJson(response, 200, offerResponse(chain, user.id));
    }
    return sendError(response, 404, 'Цепочка не найдена');
}

async function handleExchanges(request, response, url) {
    const parts = getResourceParts(url.pathname, '/api/v1/exchanges');
    if (parts.length === 2 && parts[1] === 'confirm' && request.method === 'POST') {
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        const body = await readJson(request);
        if (body?.result !== 'success' && body?.result !== 'failed') {
            return sendError(response, 400, 'Некорректное тело запроса');
        }
        // exchangeID совпадает с ID предложения (chain_id).
        const chain = chains.find((item) => item.chain_id === parts[0]);
        if (!chain) return sendError(response, 404, 'Цепочка не найдена');
        const error = confirmChain(chain, user.id, body.result === 'success', body.reason || '');
        if (error) return sendChainError(response, error);
        publishChainEvent('exchange.confirmation.created', chain);
        if (chain.status === 'completed') {
            publishChainEvent('exchange.completed', chain);
        }
        return sendJson(response, 200, {
            id: chain.chain_id,
            status: exchangeStatusOf(chain),
            offer_status: offerStatusOf(chain),
            offered_product_id: chain.from_product_id,
            requested_product_id: chain.to_product_id,
            goal_id: chain.exchange_goal_id || undefined,
        });
    }
    return sendError(response, 404, 'Ресурс не найден');
}

function createOffer(initiatorId, body) {
    // CreateOfferRequest: offered_product_id, requested_product_id, опц. поля.
    const chain = createChain(initiatorId, {
        from_product_id: body?.offered_product_id,
        to_product_id: body?.requested_product_id,
        exchange_goal_id: body?.exchange_goal_id,
        route_step_id: body?.route_step_id,
        surcharge: body?.surcharge,
        message: body?.comment,
    });
    return chain;
}

// offerResponse собирает OfferResponse так же, как httpapi.offerResponse.
function offerResponse(chain, viewerId) {
    const status = offerStatusOf(chain);
    const exchange = exchangeStatusOf(chain);
    const response = {
        id: chain.chain_id,
        status,
        role: offerRole(chain, viewerId),
        offered_product_id: chain.from_product_id,
        requested_product_id: chain.to_product_id,
        initiator_id: chain.initiator_id,
        recipient_id: chain.recipient_id,
        surcharge: {
            amount: chain.surcharge?.amount || 0,
            currency: chain.surcharge?.currency || 'RUB',
            payer: chain.surcharge?.payer || null,
        },
        conversation_id: chain.chain_id,
        expires_at: chain.expires_at,
        created_at: chain.created_at,
        updated_at: chain.updated_at,
    };
    if (chain.exchange_goal_id) response.exchange_goal_id = chain.exchange_goal_id;
    if (chain.route_step_id) response.route_step_id = chain.route_step_id;
    if (chain.message) response.comment = chain.message;
    // Обмена нет, пока предложение не приняли: пустые поля честнее идентификатора
    // сделки, которой ещё не существует.
    if (exchange) {
        response.exchange_id = chain.chain_id;
        response.exchange_status = exchange;
    }
    return response;
}

function confirmationResponse(item) {
    return {
        customer_id: item.customer_id,
        result: item.success ? 'success' : 'failed',
        reason: item.reason || '',
        created_at: item.created_at,
    };
}

// ===== FSM обмена (аналог back/internal/exchange/exchange.go) ===============

const finalStatuses = new Set([
    'completed',
    'cancelled',
    'rejected',
    'countered',
    'failed',
    'expired',
]);

// Таблица переходов: from -> { action: { actor, to } }.
const transitions = {
    pending: {
        accept: { actor: 'recipient', to: 'active' },
        decline: { actor: 'recipient', to: 'rejected' },
        counter: { actor: 'recipient', to: 'countered' },
        cancel: { actor: 'initiator', to: 'cancelled' },
        expire: { actor: 'system', to: 'expired' },
    },
};

function involves(chain, customerId) {
    return (
        Boolean(customerId) &&
        (chain.initiator_id === customerId || chain.recipient_id === customerId)
    );
}

function isExpired(chain) {
    return Boolean(chain.expires_at) && Date.now() > new Date(chain.expires_at).getTime();
}

// applyAction проверяет переход и мутирует статус цепочки. Возвращает код ошибки
// или null при успехе — аналог exchange.Apply + repo.UpdateStatus.
function applyAction(chain, action, actorId) {
    if (finalStatuses.has(chain.status)) return { status: 400, message: 'обмен уже завершён' };
    const fromMap = transitions[chain.status];
    if (!fromMap || !fromMap[action])
        return { status: 400, message: 'действие недоступно в текущем статусе' };

    // Истёкшее предложение отвечать поздно, но пометить истёкшим — можно.
    if (action !== 'expire' && isExpired(chain))
        return { status: 400, message: 'обмен уже завершён' };

    const rule = fromMap[action];
    const actorError = checkActor(chain, rule.actor, actorId);
    if (actorError) return actorError;

    chain.status = rule.to;
    return null;
}

function checkActor(chain, role, actorId) {
    if (role === 'system') return null;
    if (role === 'recipient') {
        if (chain.recipient_id !== actorId) return actorError(chain, actorId);
    }
    if (role === 'initiator') {
        if (chain.initiator_id !== actorId) return actorError(chain, actorId);
    }
    return null;
}

function actorError(chain, actorId) {
    if (!involves(chain, actorId))
        return { status: 403, message: 'пользователь не участвует в этом обмене' };
    return { status: 403, message: 'это действие доступно другой стороне' };
}

// confirmChain записывает решение стороны и закрывает сделку при итоговом статусе.
function confirmChain(chain, actorId, success, reason) {
    if (!involves(chain, actorId))
        return { status: 403, message: 'пользователь не участвует в этом обмене' };
    if (chain.status !== 'active')
        return { status: 400, message: 'действие недоступно в текущем статусе' };
    const list = confirmations[chain.chain_id] || [];
    if (list.some((item) => item.customer_id === actorId)) {
        return { status: 409, message: 'итог обмена уже подтверждён' };
    }

    const entry = {
        chain_id: chain.chain_id,
        customer_id: actorId,
        success,
        reason: success ? '' : String(reason || '').trim(),
        created_at: new Date().toISOString(),
    };
    (confirmations[chain.chain_id] ||= []).push(entry);

    const settled = resolveConfirmations(chain);
    if (settled) {
        chain.status = settled;
        chain.updated_at = new Date().toISOString();
        if (settled === 'completed') {
            const exchangedProductIds = [chain.from_product_id, chain.to_product_id];
            for (const product of products) {
                if (exchangedProductIds.includes(product.product_id)) {
                    product.status = 'exchanged';
                    product.updated_at = chain.updated_at;
                }
            }
        }
    }
    if (!settled) chain.updated_at = new Date().toISOString();
    return null;
}

// resolveConfirmations превращает подтверждения сторон в итог. Асимметрично:
// для провала достаточно одной стороны, для успеха — нужны оба.
function resolveConfirmations(chain) {
    if (chain.status !== 'active') return null;
    const list = confirmations[chain.chain_id] || [];
    const confirmed = {};
    for (const item of list) {
        if (!involves(chain, item.customer_id)) continue;
        if (!item.success) return 'failed';
        confirmed[item.customer_id] = true;
    }
    if (confirmed[chain.initiator_id] && confirmed[chain.recipient_id]) return 'completed';
    return null;
}

function canWrite(chain, actorId) {
    if (!involves(chain, actorId))
        return { status: 403, message: 'пользователь не участвует в этом обмене' };
    if (finalStatuses.has(chain.status)) return { status: 400, message: 'обмен уже завершён' };
    return null;
}

// canReview разрешает отзыв только по состоявшемуся обмену. Возвращает
// контрагента автора (кого он оценивает) или ошибку.
function canReview(chain, actorId) {
    if (!involves(chain, actorId))
        return { error: { status: 403, message: 'пользователь не участвует в этом обмене' } };
    if (chain.status !== 'completed')
        return { error: { status: 400, message: 'действие недоступно в текущем статусе' } };
    const counterparty = chain.initiator_id === actorId ? chain.recipient_id : chain.initiator_id;
    return { counterparty };
}

function statusAction(status) {
    // /chains/{id}/status принимает целевой статус, а решение принимает FSM.
    const map = {
        active: 'accept',
        rejected: 'decline',
        countered: 'counter',
        cancelled: 'cancel',
    };
    return map[status] || null;
}

function offerStatusOf(chain) {
    // countered читается как declined, истёкший pending — как expired.
    if (chain.status === 'pending' && isExpired(chain)) return 'expired';
    const map = {
        pending: 'pending',
        active: 'accepted',
        rejected: 'declined',
        countered: 'declined',
        cancelled: 'cancelled',
        expired: 'expired',
        completed: 'completed',
        failed: 'failed',
    };
    return map[chain.status] || 'pending';
}

function exchangeStatusOf(chain) {
    if (chain.status === 'completed') return 'completed';
    if (chain.status === 'failed') return 'failed';
    if (chain.status !== 'active') return '';
    const list = confirmations[chain.chain_id] || [];
    const confirmed = {};
    for (const item of list) {
        if (!involves(chain, item.customer_id)) continue;
        if (!item.success) return 'failed';
        confirmed[item.customer_id] = true;
    }
    if (confirmed[chain.initiator_id] && !confirmed[chain.recipient_id])
        return 'awaiting_recipient';
    return 'awaiting_initiator';
}

function offerRole(chain, viewerId) {
    return chain.initiator_id === viewerId ? 'outgoing' : 'incoming';
}

function parseRole(value) {
    if (value === '' || value == null) return '';
    if (value === 'incoming' || value === 'outgoing') return value;
    return null;
}

function parseStatuses(values) {
    const known = new Set([
        'pending',
        'accepted',
        'declined',
        'cancelled',
        'expired',
        'completed',
        'failed',
    ]);
    const result = [];
    for (const value of values) {
        for (const part of value.split(',')) {
            const trimmed = part.trim();
            if (!trimmed) continue;
            if (!known.has(trimmed)) return null;
            result.push(trimmed);
        }
    }
    return result;
}

// validateDeal/validateSurcharge воспроизводят exchange.Validate(+Surcharge).
function validateDeal(initiatorId, recipientId, offered, requested) {
    if (initiatorId === recipientId) throw mockError(400, 'нельзя обменяться с самим собой');
    if (offered.customer_id !== initiatorId || requested.customer_id !== recipientId) {
        throw mockError(400, 'пользователь не участвует в этом обмене');
    }
    if (offered.status !== 'active' || requested.status !== 'active') {
        throw mockError(400, 'товар недоступен для обмена');
    }
}

function validateSurcharge(initiatorId, recipientId, surcharge) {
    if (!surcharge) return;
    const amount = Number(surcharge.amount || 0);
    const payer = surcharge.payer;
    const currency = String(surcharge.currency || '').trim();
    if (amount < 0) throw mockError(400, 'доплата указана неверно');
    if (amount === 0) {
        if (payer != null) throw mockError(400, 'доплата указана неверно');
        return;
    }
    if (payer == null || (payer !== initiatorId && payer !== recipientId)) {
        throw mockError(400, 'доплата указана неверно');
    }
    if (currency.length !== 3) throw mockError(400, 'доплата указана неверно');
}

function normalizeSurcharge(surcharge) {
    if (!surcharge) return { amount: 0, currency: 'RUB', payer: null };
    const currency =
        String(surcharge.currency || '')
            .trim()
            .toUpperCase() || 'RUB';
    return {
        amount: Number(surcharge.amount || 0),
        currency,
        payer: surcharge.payer || null,
    };
}

// hasOpenOffer эмулирует уникальность активного предложения по паре товаров.
function hasOpenOffer(initiatorId, recipientId, fromId, toId) {
    return chains.some(
        (item) =>
            item.initiator_id === initiatorId &&
            item.recipient_id === recipientId &&
            item.from_product_id === fromId &&
            item.to_product_id === toId &&
            item.status === 'pending',
    );
}

function sendChainError(response, error) {
    return sendError(response, error.status, error.message);
}

// ===== Reviews =============================================================

async function handleReviews(request, response, url) {
    const parts = getResourceParts(url.pathname, '/api/v1/reviews');

    if (request.method === 'POST' && parts.length === 0) {
        const user = requireUser(request);
        if (!user) return sendError(response, 403, 'operation forbidden');
        const body = await readJson(request);
        if (
            !body?.chain_id ||
            !Number.isInteger(body.rating) ||
            body.rating < 1 ||
            body.rating > 5
        ) {
            return sendError(response, 400, 'Некорректное тело запроса');
        }
        // Кого оценивают, определяет сервис по звену обмена — не клиент.
        const chain = chains.find((item) => item.chain_id === body.chain_id);
        if (!chain) return sendError(response, 404, 'Цепочка не найдена');
        const { error, counterparty } = canReview(chain, user.id);
        if (error) return sendChainError(response, error);
        if (body.product_id) {
            const exists = products.some((item) => item.product_id === body.product_id);
            if (!exists) return sendError(response, 404, 'Товар не найден');
        }
        const now = new Date().toISOString();
        const review = {
            review_id: randomUUID(),
            chain_id: body.chain_id,
            from_customer_id: user.id,
            to_customer_id: counterparty,
            ...(body.product_id ? { product_id: body.product_id } : {}),
            rating: body.rating,
            comment: body.comment || '',
            created_at: now,
            updated_at: now,
        };
        reviews.push(review);
        return sendJson(response, 201, review);
    }

    if (parts[0] === 'by-customer' && parts.length >= 2) {
        const customerReviews = reviews.filter((item) => item.to_customer_id === parts[1]);
        if (request.method === 'GET' && parts[2] === 'rating') {
            return sendJson(response, 200, {
                average_rating: average(customerReviews.map((item) => item.rating)),
            });
        }
        if (request.method === 'GET') return sendJson(response, 200, customerReviews);
    }

    if (parts.length !== 1) return sendError(response, 404, 'Отзыв не найден');
    const index = reviews.findIndex(({ review_id: id }) => id === parts[0]);
    if (index < 0) return sendError(response, 404, 'Отзыв не найден');
    if (request.method === 'GET') return sendJson(response, 200, reviews[index]);
    if (request.method === 'DELETE') {
        reviews.splice(index, 1);
        response.writeHead(204);
        return response.end();
    }
    return sendError(response, 405, 'Метод не поддерживается');
}

// ===== Wishlists ===========================================================

async function handleWishlists(request, response, url) {
    const parts = getResourceParts(url.pathname, '/api/v1/wishlists');

    if (parts[0] === 'by-product' && parts.length === 2 && request.method === 'GET') {
        const wishlist = wishlists.find((item) => item.product_id === parts[1]);
        return wishlist
            ? sendJson(response, 200, wishlist)
            : sendError(response, 404, 'Список желаний не найден');
    }

    if (request.method === 'POST' && parts.length === 0) {
        const body = await readJson(request);
        if (!body?.product_id || !body?.name)
            return sendError(response, 400, 'Некорректное тело запроса');
        const now = new Date().toISOString();
        const wishlist = {
            wishlist_id: randomUUID(),
            product_id: body.product_id,
            name: body.name,
            created_at: now,
            updated_at: now,
        };
        wishlists.push(wishlist);
        return sendJson(response, 201, wishlist);
    }

    if (parts.length >= 2 && parts[1] === 'options') {
        const wishlist = wishlists.find((item) => item.wishlist_id === parts[0]);
        if (!wishlist) return sendError(response, 404, 'Список желаний не найден');
        if (request.method === 'GET' && parts.length === 2) {
            return sendJson(
                response,
                200,
                categories.filter((item) =>
                    (wishlistOptions[wishlist.wishlist_id] || []).includes(item.category_id),
                ),
            );
        }
        if (request.method === 'POST' && parts.length === 2) {
            const body = await readJson(request);
            if (!body?.category_id) return sendError(response, 400, 'Некорректное тело запроса');
            wishlistOptions[wishlist.wishlist_id] ||= [];
            if (!wishlistOptions[wishlist.wishlist_id].includes(body.category_id)) {
                wishlistOptions[wishlist.wishlist_id].push(body.category_id);
            }
            response.writeHead(204);
            return response.end();
        }
        if (request.method === 'DELETE' && parts.length === 3) {
            wishlistOptions[wishlist.wishlist_id] = (
                wishlistOptions[wishlist.wishlist_id] || []
            ).filter((id) => id !== parts[2]);
            response.writeHead(204);
            return response.end();
        }
    }

    if (parts.length !== 1) return sendError(response, 404, 'Список желаний не найден');
    const index = wishlists.findIndex(({ wishlist_id: id }) => id === parts[0]);
    if (index < 0) return sendError(response, 404, 'Список желаний не найден');
    if (request.method === 'GET') return sendJson(response, 200, wishlists[index]);
    if (request.method === 'DELETE') {
        delete wishlistOptions[wishlists[index].wishlist_id];
        wishlists.splice(index, 1);
        response.writeHead(204);
        return response.end();
    }
    return sendError(response, 405, 'Метод не поддерживается');
}

// ===== Notifications =======================================================

// Отметки прочтения: { [customer_id]: { `${chain_id}:${kind}`: NotificationRead } }.
// Уведомления как таковые не хранятся — фронт собирает их из цепочек
// (см. buildNotifications), с бэкенда приходят только отметки прочтения.
const notificationReads = {};

const NOTIFICATION_KINDS = new Set([
    'incoming_offer',
    'outgoing_pending',
    'in_progress',
    'finished',
]);

async function handleNotifications(request, response, url) {
    const parts = getResourceParts(url.pathname, '/api/v1/notifications');
    const user = requireUser(request);
    if (!user) return sendError(response, 403, 'operation forbidden');

    if (request.method === 'GET' && parts.length === 1 && parts[0] === 'read-statuses') {
        return sendJson(response, 200, Object.values(notificationReads[user.id] || {}));
    }

    // read-all помечает прочитанными все события пользователя разом: фронт
    // считает уведомление прочитанным по паре chain_id + kind, поэтому здесь
    // перебираются те же виды, что вычисляет buildNotifications.
    if (request.method === 'PUT' && parts.length === 1 && parts[0] === 'read-all') {
        const readAt = new Date().toISOString();
        const reads = (notificationReads[user.id] ||= {});
        for (const chain of chains) {
            if (!involves(chain, user.id)) continue;
            for (const kind of NOTIFICATION_KINDS) {
                reads[`${chain.chain_id}:${kind}`] = {
                    chain_id: chain.chain_id,
                    kind,
                    read_at: readAt,
                };
            }
        }
        response.writeHead(204);
        return response.end();
    }

    if (request.method === 'PUT' && parts.length === 2 && parts[1] === 'read') {
        const body = await readJson(request);
        const kind = body?.kind;
        if (!NOTIFICATION_KINDS.has(kind))
            return sendError(response, 400, 'Некорректное тело запроса');
        const chain = chains.find(({ chain_id: id }) => id === parts[0]);
        if (!chain) return sendError(response, 404, 'Цепочка не найдена');
        if (!involves(chain, user.id))
            return sendError(response, 403, 'пользователь не участвует в этом обмене');
        (notificationReads[user.id] ||= {})[`${chain.chain_id}:${kind}`] = {
            chain_id: chain.chain_id,
            kind,
            read_at: new Date().toISOString(),
        };
        response.writeHead(204);
        return response.end();
    }

    return sendError(response, 404, 'Ресурс не найден');
}

// ===== Events (SSE) ========================================================

// Подписчики потока событий: { [customer_id]: Set<ServerResponse> }.
const eventSubscribers = new Map();
const EVENT_HEARTBEAT_MS = 25_000;

/** Держит SSE-поток открытым — повторяет eventsHandler.stream. */
function streamEvents(request, response) {
    const user = requireUser(request);
    if (!user) return sendError(response, 401, 'missing authorization header');

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
    });
    response.write(': keepalive\n\n');

    if (!eventSubscribers.has(user.id)) eventSubscribers.set(user.id, new Set());
    eventSubscribers.get(user.id).add(response);

    const heartbeat = setInterval(() => response.write(': keepalive\n\n'), EVENT_HEARTBEAT_MS);

    request.on('close', () => {
        clearInterval(heartbeat);
        const subscribers = eventSubscribers.get(user.id);
        subscribers?.delete(response);
        if (subscribers && subscribers.size === 0) eventSubscribers.delete(user.id);
    });
}

/**
 * Рассылает событие обеим сторонам звена — как chainService.publish.
 * @param type Тип события из events.Broker (`exchange.*`).
 * @param chain Звено, которого касается событие.
 */
function publishChainEvent(type, chain) {
    if (!chain) return;

    const payload = `event: ${type}\ndata: ${JSON.stringify({
        type,
        chain_id: chain.chain_id,
    })}\n\n`;
    const recipients = new Set([chain.initiator_id, chain.recipient_id].filter(Boolean));

    for (const customerId of recipients) {
        for (const subscriber of eventSubscribers.get(customerId) || []) {
            subscriber.write(payload);
        }
    }
}

// ===== Search ==============================================================

function findChain(request, response, params) {
    const user = requireUser(request);
    if (!user) return sendError(response, 403, 'operation forbidden');
    const target = params.get('target_product_id');
    if (!target) return sendError(response, 400, 'Некорректный поисковый запрос');
    const maxDepthRaw = params.get('max_depth');
    if (maxDepthRaw !== null) {
        const depth = Number.parseInt(maxDepthRaw, 10);
        if (!Number.isFinite(depth) || depth < 1)
            return sendError(response, 400, 'Некорректный поисковый запрос');
    }
    // Mock не воспроизводит BFS-поиск графа обменов, но контракт ответа 1-в-1.
    const result = chains.find(
        (item) => item.to_product_id === target && item.status !== 'cancelled',
    );
    const chain = result
        ? [
              products.find((item) => item.product_id === result.from_product_id),
              products.find((item) => item.product_id === result.to_product_id),
          ].filter(Boolean)
        : [];
    return sendJson(response, 200, { chain, length: chain.length });
}

/**
 * Соседи по вишлисту: активные чужие товары, чьи владельцы хотят категорию
 * source. Повторяет productRepository.GetExchangeCandidates.
 */
function exchangeCandidates(source) {
    if (!source.category_id) return [];
    return products.filter((item) => {
        if (item.product_id === source.product_id) return false;
        if (item.customer_id === source.customer_id) return false;
        if (item.status !== 'active') return false;
        const wishlist = wishlists.find((entry) => entry.product_id === item.product_id);
        const wanted = wishlist ? wishlistOptions[wishlist.wishlist_id] || [] : [];
        return wanted.includes(source.category_id);
    });
}

function findCandidates(request, response, params) {
    const user = requireUser(request);
    if (!user) return sendError(response, 403, 'operation forbidden');

    const productId = params.get('product_id');
    if (!productId) return sendError(response, 400, 'Некорректный поисковый запрос');

    let limit = 8;
    const limitRaw = params.get('limit');
    if (limitRaw !== null) {
        const parsed = Number.parseInt(limitRaw, 10);
        if (!Number.isFinite(parsed) || parsed <= 0)
            return sendError(response, 400, 'Некорректный поисковый запрос');
        limit = parsed;
    }

    const source = products.find((item) => item.product_id === productId);
    if (!source) return sendError(response, 404, 'Товар не найден');

    const seen = new Set([source.product_id]);
    const result = [];

    for (const candidate of exchangeCandidates(source)) {
        if (seen.has(candidate.product_id)) continue;
        seen.add(candidate.product_id);
        result.push(candidate);
        if (result.length >= limit) return sendJson(response, 200, { products: result });
    }

    // Кандидатов по вишлисту не хватило — дозаполняем остальными активными
    // товарами каталога, кроме собственных вещей владельца source.
    const rest = products
        .filter((item) => item.status === 'active' && item.customer_id !== source.customer_id)
        .sort(sortByDateDesc);
    for (const product of rest) {
        if (seen.has(product.product_id)) continue;
        seen.add(product.product_id);
        result.push(product);
        if (result.length >= limit) break;
    }

    return sendJson(response, 200, { products: result });
}

function productRecommendations(request, response, productId) {
    const user = requireUser(request);
    if (!user) return sendError(response, 403, 'operation forbidden');

    const myProducts = products.filter((item) => item.customer_id === user.id);
    if (myProducts.length === 0)
        return sendError(response, 400, 'invalid input: у пользователя нет товаров для обмена');

    const result = chains.find(
        (item) => item.to_product_id === productId && item.status !== 'cancelled',
    );
    const productsInChain = result
        ? [
              products.find((item) => item.product_id === result.from_product_id),
              products.find((item) => item.product_id === result.to_product_id),
          ].filter(Boolean)
        : [];

    return sendJson(response, 200, {
        Products: productsInChain,
        Length: productsInChain.length,
    });
}

// ===== Общие хелперы =======================================================

function fullChain(chain) {
    return chains.filter(
        (item) =>
            item.chain_id === chain.chain_id ||
            item.chain_id === chain.previous_chain_id ||
            item.chain_id === chain.next_chain_id,
    );
}

function makeCustomer(email, password, fullName = '') {
    const now = new Date().toISOString();
    return {
        customer_id: randomUUID(),
        email,
        full_name: fullName,
        password,
        is_active: true,
        created_at: now,
        updated_at: now,
    };
}

function makeProduct(body) {
    const now = new Date().toISOString();
    return {
        product_id: randomUUID(),
        customer_id: body.customer_id,
        ...(body.category_id ? { category_id: body.category_id } : {}),
        title: body.title,
        ...(body.description ? { description: body.description } : {}),
        ...(body.image ? { image: body.image } : {}),
        ...(body.price !== undefined ? { price: body.price } : {}),
        ...(body.location ? { location: body.location } : {}),
        status: body.status || 'active',
        created_at: now,
        updated_at: now,
    };
}

function makeCategory(body) {
    const now = new Date().toISOString();
    return {
        category_id: randomUUID(),
        name: body.name,
        ...(body.parent_id ? { parent_id: body.parent_id } : {}),
        created_at: now,
        updated_at: now,
    };
}

function mockError(status, message) {
    return { status, message };
}

// customerRecommendationList повторяет domain.CustomerWishlistOption[]: пары
// customer_id/category_id, а не полные карточки категорий.
function customerRecommendationList(customerId) {
    return (customerRecommendations[customerId] || []).map((categoryId) => ({
        customer_id: customerId,
        category_id: categoryId,
    }));
}

function addCustomerRecommendation(customerId, categoryId) {
    const list = customerRecommendations[customerId] || (customerRecommendations[customerId] = []);
    if (!list.includes(categoryId)) list.push(categoryId);
}

function publicCustomer(customer) {
    const result = { ...customer };
    delete result.password;
    delete result.is_active;
    // Алиас демо-профиля — деталь стенда: в модели бэкенда его нет.
    delete result.demo_customer_id;
    return result;
}

// customerOverview повторяет domain.CustomerOverview: профиль вместе с
// показателями, которые бэкенд считает подзапросами по отзывам, товарам и
// цепочкам, а не хранит полями.
function customerOverview(customer) {
    const id = customer.customer_id;
    const received = reviews.filter((review) => review.to_customer_id === id);
    const owned = products.filter((product) => product.customer_id === id);
    return {
        customer_id: id,
        email: customer.email,
        full_name: customer.full_name || '',
        rating: average(received.map((review) => review.rating)),
        review_count: received.length,
        product_count: owned.length,
        active_product_count: owned.filter((product) => product.status === 'active').length,
        chain_count: chains.filter(
            (chain) => chain.initiator_id === id || chain.recipient_id === id,
        ).length,
        created_at: customer.created_at,
    };
}

function activeCustomers() {
    return customers.filter((item) => item.is_active);
}

function activeProducts() {
    return products.filter((item) => item.status !== 'archived');
}

function average(values) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function pick(value, keys) {
    return Object.fromEntries(
        keys.filter((key) => value[key] !== undefined).map((key) => [key, value[key]]),
    );
}

function getResourceParts(pathname, prefix) {
    return pathname.slice(prefix.length).split('/').filter(Boolean);
}

function sliceBounds(params) {
    const offset = Math.max(0, Number.parseInt(params.get('offset') || '0', 10) || 0);
    const limit = Math.min(
        100,
        Math.max(
            1,
            Number.parseInt(params.get('limit') || String(defaultLimit), 10) || defaultLimit,
        ),
    );
    return [offset, offset + limit];
}

function guessImageExt(contentType) {
    if (contentType.includes('png')) return '.png';
    if (contentType.includes('gif')) return '.gif';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg';
    return '.bin';
}

function readJson(request) {
    return new Promise((resolve) => {
        let body = '';
        request.setEncoding('utf8');
        request.on('data', (chunk) => {
            body += chunk;
        });
        request.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : undefined);
            } catch {
                resolve(undefined);
            }
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

// Страховка: ни одно неперехваченное исключение из async-хендлера не должно
// ронять процесс — достаточно залогировать его.
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection in mock-api:', reason);
});

server.listen(port, () => console.log(`Mock API слушает http://localhost:${port}`));
