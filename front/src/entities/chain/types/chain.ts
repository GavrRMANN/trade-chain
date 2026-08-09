export type TChainStatus =
    | 'pending'
    | 'active'
    | 'completed'
    | 'cancelled'
    | 'rejected'
    | 'countered'
    | 'failed'
    | 'expired';

export type TChain = {
    /** Уникальный идентификатор звена цепочки. */
    chain_id: string;
    /** Идентификатор исходного товара. */
    from_product_id: string;
    /** Идентификатор целевого товара. */
    to_product_id: string;
    /** Идентификатор пользователя, инициировавшего цепочку. */
    initiator_id: string;
    /** Идентификатор получателя предложения. */
    recipient_id?: string;
    /** Идентификатор предыдущего звена цепочки. */
    previous_chain_id?: string;
    /** Идентификатор следующего звена цепочки. */
    next_chain_id?: string;
    /** Текущий статус звена цепочки. */
    status: TChainStatus;
    /** Сообщение или комментарий к звену. */
    message?: string;
    /** Идентификатор конечной цели персонального маршрута. */
    exchange_goal_id?: string;
    /** Идентификатор текущего этапа персонального маршрута. */
    route_step_id?: string;
    /** Срок действия предложения в ISO 8601. */
    expires_at?: string;
    /** Дата создания звена в ISO 8601. */
    created_at: string;
    /** Дата последнего обновления звена в ISO 8601. */
    updated_at: string;
};

export type TCreateChainRequest = {
    /** Идентификатор исходного товара. */
    from_product_id: string;
    /** Идентификатор целевого товара. */
    to_product_id: string;
    /** Идентификатор предыдущего звена цепочки. */
    previous_chain_id?: string;
    /** Идентификатор следующего звена цепочки. */
    next_chain_id?: string;
    /** Идентификатор конечной цели персонального маршрута. */
    exchange_goal_id?: string;
    /** Идентификатор текущего этапа персонального маршрута. */
    route_step_id?: string;
    /** Начальный статус звена. */
    status: TChainStatus;
    /** Сообщение или комментарий к звену. */
    message?: string;
};

export type TUpdateChainStatus = 'pending' | 'active' | 'cancelled' | 'rejected' | 'countered';
export type TUpdateChainStatusRequest = { status: TUpdateChainStatus };

export type TChainMessage = {
    message_id: string;
    chain_id: string;
    customer_id: string;
    body: string;
    created_at: string;
};

export type TConfirmChainRequest = { success: boolean };

export type TChainConfirmation = {
    customer_id: string;
    result: 'success' | 'failed';
    reason?: string;
    created_at: string;
};

export type TChainDetails = {
    confirmations: TChainConfirmation[];
};

export type TSendChainMessageRequest = { body: string };
