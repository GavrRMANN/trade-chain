export type TChainStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'rejected';

export type TChain = {
    /** Уникальный идентификатор звена цепочки. */
    chain_id: string;
    /** Идентификатор исходного товара. */
    from_product_id: string;
    /** Идентификатор целевого товара. */
    to_product_id: string;
    /** Идентификатор пользователя, инициировавшего цепочку. */
    initiator_id: string;
    /** Идентификатор предыдущего звена цепочки. */
    previous_chain_id?: string;
    /** Идентификатор следующего звена цепочки. */
    next_chain_id?: string;
    /** Текущий статус звена цепочки. */
    status: TChainStatus;
    /** Сообщение или комментарий к звену. */
    message?: string;
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
    /** Начальный статус звена. */
    status: TChainStatus;
    /** Сообщение или комментарий к звену. */
    message?: string;
};

export type TUpdateChainStatusRequest = {
    /** Новый статус звена цепочки. */
    status: TChainStatus;
};
