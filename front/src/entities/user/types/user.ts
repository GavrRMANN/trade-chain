export type TUser = {
    id: string;
    email: string;
    accountName: string;
    createdAt: string;
};

export type TUserProfile = TUser & {
    password?: string;
};

export type TRegisterPayload = {
    accountName: string;
    password: string;
};

export type TLoginPayload = {
    accountName: string;
    password: string;
};
