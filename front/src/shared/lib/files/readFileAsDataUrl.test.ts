import { afterEach, describe, expect, it, vi } from 'vitest';

import { readFileAsDataUrl } from './readFileAsDataUrl';

class MockFileReader {
    static lastInstance: MockFileReader | undefined;
    result: string | ArrayBuffer | null = null;
    error: Error | null = null;
    private readonly listeners = new Map<string, () => void>();

    constructor() {
        MockFileReader.lastInstance = this;
    }

    addEventListener(type: string, listener: () => void) {
        this.listeners.set(type, listener);
    }

    readAsDataURL() {}

    emit(type: string) {
        this.listeners.get(type)?.();
    }
}

describe('readFileAsDataUrl', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('возвращает data URL после успешного чтения', async () => {
        vi.stubGlobal('FileReader', MockFileReader);
        const promise = readFileAsDataUrl(new File(['content'], 'photo.txt'));
        MockFileReader.lastInstance!.result = 'data:text/plain;base64,Y29udGVudA==';
        MockFileReader.lastInstance!.emit('load');

        await expect(promise).resolves.toBe('data:text/plain;base64,Y29udGVudA==');
    });

    it('отклоняет promise при ошибке чтения', async () => {
        vi.stubGlobal('FileReader', MockFileReader);
        const promise = readFileAsDataUrl(new File(['content'], 'photo.txt'));
        const error = new Error('read failed');
        MockFileReader.lastInstance!.error = error;
        MockFileReader.lastInstance!.emit('error');

        await expect(promise).rejects.toBe(error);
    });

    it('отклоняет promise, если результат чтения не строка', async () => {
        vi.stubGlobal('FileReader', MockFileReader);
        const promise = readFileAsDataUrl(new File(['content'], 'photo.txt'));
        MockFileReader.lastInstance!.result = new ArrayBuffer(0);
        MockFileReader.lastInstance!.emit('load');

        await expect(promise).rejects.toThrow('Не удалось прочитать файл');
    });
});
