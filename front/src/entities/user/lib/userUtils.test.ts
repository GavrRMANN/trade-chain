import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { getUserLocalStorage, removeUserLocalStorage, setUserLocalStorage } from './userUtils';

const user = {
    id: 'user-1',
    firstName: 'Иван',
    lastName: 'Иванов',
    email: 'ivan@example.com',
} as Parameters<typeof setUserLocalStorage>[0];

class MemoryStorage implements Storage {
    private store = new Map<string, string>();

    get length() {
        return this.store.size;
    }

    clear() {
        this.store.clear();
    }

    getItem(key: string) {
        return this.store.has(key) ? this.store.get(key)! : null;
    }

    key(index: number) {
        return [...this.store.keys()][index] ?? null;
    }

    removeItem(key: string) {
        this.store.delete(key);
    }

    setItem(key: string, value: string) {
        this.store.set(key, value);
    }
}

describe('userUtils', () => {
    beforeAll(() => {
        globalThis.localStorage = new MemoryStorage();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('возвращает undefined, если в хранилище нет данных пользователя', () => {
        expect(getUserLocalStorage()).toBeUndefined();
    });

    it('сохраняет и возвращает данные пользователя', () => {
        setUserLocalStorage(user);

        expect(getUserLocalStorage()).toEqual(user);
    });

    it('удаляет данные пользователя из хранилища', () => {
        setUserLocalStorage(user);
        removeUserLocalStorage();

        expect(getUserLocalStorage()).toBeUndefined();
    });

    it('удаляет повреждённые данные и возвращает undefined', () => {
        localStorage.setItem('user', 'не json');

        expect(getUserLocalStorage()).toBeUndefined();
        expect(localStorage.getItem('user')).toBeNull();
    });
});
