import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export type TCatalogViewMode = 'feed' | 'grid';

const STORAGE_KEY = 'catalog-view-mode';
const DEFAULT_MODE: TCatalogViewMode = 'grid';

const isViewMode = (value: string | null): value is TCatalogViewMode =>
    value === 'feed' || value === 'grid';

/** localStorage может быть недоступен (приватный режим, отключённые куки). */
const readStoredMode = (): TCatalogViewMode | undefined => {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return isViewMode(stored) ? stored : undefined;
    } catch {
        return undefined;
    }
};

const writeStoredMode = (mode: TCatalogViewMode) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
        // Режим — не та настройка, ради которой стоит показывать ошибку.
    }
};

/**
 * Хранит выбранный режим каталога: лента или сетка.
 *
 * Источник правды — параметр `?view`, чтобы ссылка на ленту делилась и
 * переживала перезагрузку. localStorage подхватывается только при первом
 * заходе без параметра: он отвечает за «последний выбор запомнился» между
 * сессиями, но не спорит с явным адресом.
 */
export const useCatalogViewMode = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const paramMode = searchParams.get('view');
    // localStorage читается только пока адрес не задаёт режим явно —
    // вычисление от параметра, а не на каждом рендере, держит тело чистым.
    const viewMode = useMemo<TCatalogViewMode>(
        () => (isViewMode(paramMode) ? paramMode : (readStoredMode() ?? DEFAULT_MODE)),
        [paramMode],
    );

    useEffect(() => {
        if (isViewMode(paramMode)) {
            return;
        }

        // Параметр дописывается через replace: возврат назад должен вести на
        // предыдущий экран, а не на ту же страницу без ?view.
        setSearchParams(
            (currentParams) => {
                currentParams.set('view', viewMode);
                return currentParams;
            },
            { replace: true },
        );
    }, [paramMode, setSearchParams, viewMode]);

    const setViewMode = useCallback(
        (mode: TCatalogViewMode) => {
            writeStoredMode(mode);
            setSearchParams((currentParams) => {
                currentParams.set('view', mode);
                return currentParams;
            });
        },
        [setSearchParams],
    );

    return { viewMode, setViewMode };
};
