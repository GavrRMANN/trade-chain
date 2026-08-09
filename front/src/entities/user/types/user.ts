export type TUser = {
    /** Уникальный идентификатор клиента. */
    customer_id: string;
    /** Электронная почта клиента. */
    email: string;
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

export type TAuthResponse = {
    /** JWT-токен для авторизованных запросов. */
    token: string;
    /** Пользователь, созданный или авторизованный на backend. */
    user: TUser;
};
