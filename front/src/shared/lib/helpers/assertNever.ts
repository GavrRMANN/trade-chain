/**
 * Гарантирует полноту switch по union-типу: если появится новый вариант,
 * TypeScript не даст пройти вызов `assertNever` значением, отличным от `never`.
 *
 * @param value Значение ветки `default` — всегда `never`, пока covered все варианты.
 * @param hint Откуда пришёл вызов — для читаемого сообщения об ошибке.
 * @returns Никогда не возвращает — бросает исключение.
 */
export function assertNever(value: never, hint?: string): never {
    throw new Error(
        `Unhandled variant${hint ? ` in ${hint}` : ''}: ${JSON.stringify(value)}`,
    );
}
