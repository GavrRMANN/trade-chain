/**
 * Маскирует почту, оставляя первые два символа адреса и домен.
 * @param email Электронная почта.
 * @returns Маскированная строка вида «al***@example.com».
 */
export const maskEmail = (email: string): string => {
    const [name, domain] = email.split('@');
    if (!domain) return 'Пользователь';
    return `${name.slice(0, 2)}***@${domain}`;
};

/**
 * Отображаемое имя пользователя: ФИО, если оно заполнено, иначе маскированная почта.
 * @param fullName ФИО пользователя, может быть пустой строкой.
 * @param email Электронная почта пользователя.
 * @returns Строка для отображения.
 */
export const getDisplayName = (fullName: string | undefined, email: string | undefined): string => {
    const trimmedFullName = fullName?.trim();
    if (trimmedFullName) return trimmedFullName;
    return email ? maskEmail(email) : '';
};
