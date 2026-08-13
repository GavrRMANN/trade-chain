import { randomUUID } from 'node:crypto';

/** Короткий уникальный хвост для email/названий, чтобы параллельные воркеры не сталкивались. */
export const uniqueSuffix = (): string => randomUUID().slice(0, 8);

export const generateTestEmail = (prefix = 'e2e'): string =>
    `${prefix}.${Date.now()}.${uniqueSuffix()}@example.test`;

export const generateProductTitle = (prefix = 'E2E товар'): string => `${prefix} ${uniqueSuffix()}`;

/**
 * Повторяет маскирование почты из shared/lib/formatters/displayName.ts —
 * без full_name профиль показывает именно эту строку как имя пользователя.
 */
export const expectedMaskedName = (email: string): string => {
    const [localPart, domain] = email.split('@');
    return `${localPart.slice(0, 2)}***@${domain}`;
};
