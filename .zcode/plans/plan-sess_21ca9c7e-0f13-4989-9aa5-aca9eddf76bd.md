# План: юзер-стори страницы товара для продавца и покупателя

Бартер-платформа. «Предложение обмена» реализовано через сущность **Chain** (`POST /chains/`): покупатель предлагает свой товар (`from_product_id`) за товар продавца (`to_product_id`). Бекенд НЕ меняем. Все нужные RTK Query хуки уже зарегистрированы. Работаем по FSD.

## Реализуемые сценарии
1. **Предложить обмен** (покупатель) — модалка: выбор своего товара + сообщение → `useCreateChainMutation`.
2. **Управлять «хочу взамен»** (продавец) — добавить/убрать желаемые категории → wishlist мутации.
3. **Счётчик входящих предложений** (продавец) — `useGetChainsByProductQuery`, кнопка-заглушка «Перейти к предложениям» (полный экран сделок вне скоупа).
4. **Репутация продавца** (покупатель) — средний рейтинг `useGetCustomerRatingQuery` (звёзды) + список отзывов (сейчас только счётчик).

## Слой features (новое) — бизнес-UI по FSD

**`features/exchange/ui/`** — «Предложить обмен»
- `OfferExchangeModal.tsx` + `.module.css` — модалка на `shared/ui/modal`. Контент: список товаров пользователя (`useGetProductsByCustomerQuery(currentUserId)`) как выбираемые карточки (переиспользуем `ProductCard` или селект), поле сообщения (`shared/ui/input`), кнопка сабмита (`shared/ui/button`, `loading`). Закрытие/открытие через `isOpen`/`onClose`. После успеха — `onSuccess` callback (рефреш + закрытие + тост/сообщение).
- `index.ts` — barrel.

**`features/wishlist/ui/`** — «Хочу взамен» (управление продавцом)
- `WishlistEditor.tsx` + `.module.css` — для владельца: список текущих желаемых категорий с кнопкой «убрать» (`useRemoveWishlistOptionMutation`), и селект/Selector для добавления (`useAddWishlistOptionMutation`) из `useGetCategoriesQuery`. Создание вишлиста, если его нет (`useCreateWishlistMutation`). Небольшой хук состояния внутри.
- `index.ts` — barrel.

## Слой pages/product (расширяем существующее по аналогии)

**`pages/product/lib/useProductPageData.ts`** — дополнить возвращаемое:
- `averageRating` через `useGetCustomerRatingQuery(product.customer_id)` (пропустить, если нет product).
- `incomingOffers` через `useGetChainsByProductQuery(productId)` (для владельца — счётчик).
- `currentUserId` (уже есть `isOwner`, отдам также id).
- Мутации НЕ здесь — они в features (FSD: page только собирает данные для отображения; мутации остаются в feature-компонентах). Страница прокидывает productId/product/customer/дерево действий вниз.

**`pages/product/ui/ProductPage.tsx`** — перегруппировать aside:
- **Покупатель (не владелец):** блок «Предложить обмен» (кнопка → открывает `OfferExchangeModal`); блок репутации (звёзды + отзывы раскрывающимся списком, замена простого счётчика). Сохранить «Что хочет взамен» (readonly) и «Ваши подходящие вещи».
- **Владелец:** кнопка «Редактировать» (уже есть); блок «Хочу взамен» → `WishlistEditor` (вместо readonly-вывода); счётчик «Входящих предложений: N» + кнопка-заглушка «Перейти к предложениям».
- Состояние модалки оффера — `useState` в странице.

**`pages/product/ui/product-page.module.css`** — добавить классы под новые блоки (рейтинг/звёзды, список офферов), по БЭМ в существующем camelCase-стиле файла (соответствует конвенции именно этой страницы).

## Рейтинг/звёзды (новый shared-компонент)
- `shared/ui/rating/Rating.tsx` + `.module.css` + `index.ts` — принимает `value: number` (0–5), рендерит 5 иконок `Star.svg` (уже есть в `assets/icons`), заполненные по `Math.round(value)`. Без интеракции (только отображение). БЭМ-блок `rating`.

## Чего НЕ трогаем
- Бекенд, store (всё зарегистрировано), сущности (хуки существуют), mock-api.
- Существующие readonly-блоки «Что хочет взамен»/«Подходящие вещи» — сохраняем для покупателей; для владельца «Что хочу взамен» заменяется на редактор.

## Порядок работы
1. `shared/ui/rating` (звёзды) + стили.
2. `features/exchange` (модалка оффера).
3. `features/wishlist` (редактор желаемых категорий).
4. Расширить `useProductPageData` (rating, incomingOffers, currentUserId).
5. Перегруппировать `ProductPage` UI (buyer/owner ветки + новые блоки) + CSS.
6. Проверка `tsc`/`build`/`eslint`.

## Риски/замечания по бекенду (для команды, фикс не делаем)
- `TCreateChainRequest.status` обязателен на фронте, но бекенд всё равно перезаписывает на `pending` — шлём `'pending'`.
- `useGetWishlistOptionsQuery` возвращает `Category[]` (не `TWishlistOption[]`) — используем `.category_id`/`.name`.
- Auth-посредник глобально закомментирован; ownership chain-ов enforced в логике — мутации могут 403 без токена, показываем ошибку пользователю.
- Нет `updateWishlist` — только create/delete; нет `products/by-customer` на бекенд-роутах (но фронт-хук есть — если 404, обрабатываем как пустой список).