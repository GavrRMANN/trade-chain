CREATE TABLE chain_notification_reads (
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    chain_id UUID NOT NULL REFERENCES chains(chain_id) ON DELETE CASCADE,
    kind VARCHAR(32) NOT NULL CHECK (kind IN (
        'incoming_offer', 'outgoing_pending', 'in_progress', 'finished'
    )),
    read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id, chain_id, kind)
);

CREATE INDEX idx_chain_notification_reads_customer_id
    ON chain_notification_reads(customer_id);
