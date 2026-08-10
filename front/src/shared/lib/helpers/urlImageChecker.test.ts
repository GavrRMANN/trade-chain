import { afterEach, describe, expect, it, vi } from 'vitest';

import { checkImageUrl } from './urlImageChecker';

class MockImage {
    static lastInstance: MockImage | undefined;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    src = '';

    constructor() {
        MockImage.lastInstance = this;
    }
}

describe('checkImageUrl', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('возвращает true для загруженного изображения', async () => {
        vi.stubGlobal('Image', MockImage);
        const promise = checkImageUrl('https://example.com/photo.jpg');
        MockImage.lastInstance!.onload?.();

        await expect(promise).resolves.toBe(true);
        expect(MockImage.lastInstance!.src).toBe('https://example.com/photo.jpg');
    });

    it('возвращает false для изображения с ошибкой загрузки', async () => {
        vi.stubGlobal('Image', MockImage);
        const promise = checkImageUrl('https://example.com/missing.jpg');
        MockImage.lastInstance!.onerror?.();

        await expect(promise).resolves.toBe(false);
    });
});
