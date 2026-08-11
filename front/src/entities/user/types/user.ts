export type TUser = {
    /** Уникальный идентификатор клиента. */
    customer_id: string;
    /** Электронная почта клиента. */
    email: string;
    /** ФИО клиента. Пустая строка, если не заполнено. */
    full_name: string;
    /** Дата создания профиля в ISO 8601. */
    created_at: string;
    /** Дата последнего обновления профиля в ISO 8601. */
    updated_at: string;
};

export type TUserProfile = TUser;

export type TRegisterPayload = {
    /** Электронная почта для регистрации. */
    email: string;
    /** Пароль пользователя. */
    password: string;
};

export type TLoginPayload = {
    /** Электронная почта для входа. */
    email: string;
    /** Пароль пользователя. */
    password: string;
};

/**
 * Вход по выбору участника, без пароля.
 *
 * Существует ради демонстрации: чтобы увидеть обмен, нужны две стороны с
 * товарами и историей, а пустой свежезарегистрированный аккаунт не показывает
 * ни каталога, ни цепочки. Бэкенд поднимает такой вход только при включённом
 * DEMO_LOGIN_ENABLED и иначе отвечает 403.
 */
export type TDemoLoginPayload = {
    /** Идентификатор участника, под которым нужно войти. */
    customer_id: string;
};

export type TAuthResponse = {
    /** JWT-токен для авторизованных запросов. */
    token: string;
    /** Пользователь, созданный или авторизованный на backend. */
    user: TUser;
};
