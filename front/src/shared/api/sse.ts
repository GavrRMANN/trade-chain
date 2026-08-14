import { getApiBaseUrl } from './config';

export type TSseEvent = {
    type: string;
    chain_id: string;
};

const parseEvent = (chunk: string): TSseEvent | undefined => {
    const type = chunk.match(/^event: (.+)$/m)?.[1];
    const data = chunk.match(/^data: (.+)$/m)?.[1];

    if (!type || !data) return undefined;

    try {
        const payload = JSON.parse(data) as Partial<TSseEvent>;
        return typeof payload.chain_id === 'string'
            ? { type, chain_id: payload.chain_id }
            : undefined;
    } catch {
        return undefined;
    }
};

/** Открывает авторизованный SSE-поток и передаёт валидные события подписчику. */
export const subscribeToEvents = async (
    token: string,
    signal: AbortSignal,
    onEvent: (event: TSseEvent) => void,
): Promise<void> => {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/events`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
    });

    if (!response.ok || !response.body) {
        throw new Error(String(response.status));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (!signal.aborted) {
        const { done, value } = await reader.read();
        if (done) return;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split('\n\n');
        buffer = frames.pop() ?? '';

        for (const frame of frames) {
            const event = parseEvent(frame);
            if (event) onEvent(event);
        }
    }
};
