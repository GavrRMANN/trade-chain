export type TUser = {
    customer_id: string;
    email: string;
    created_at: string;
    updated_at: string;
};

export type TUserProfile = TUser;

export type TRegisterPayload = {
    email: string;
    password: string;
};

export type TLoginPayload = {
    email: string;
    password: string;
};

export type TAuthResponse = {
    token: string;
};
