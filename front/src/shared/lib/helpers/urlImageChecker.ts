export const checkImageUrl = (url: string, signal?: AbortSignal): Promise<boolean> =>
    new Promise((resolve) => {
        const image = new Image();

        const onAbort = () => {
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            image.onload = null;
            image.onerror = null;
            signal?.removeEventListener('abort', onAbort);
        };

        if (signal?.aborted) {
            resolve(false);
            return;
        }

        signal?.addEventListener('abort', onAbort, { once: true });

        image.onload = () => {
            cleanup();
            resolve(true);
        };

        image.onerror = () => {
            cleanup();
            resolve(false);
        };

        image.src = url;
    });