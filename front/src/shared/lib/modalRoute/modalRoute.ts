export type TModalRouteEntity = 'auth' | 'clients' | 'deals' | 'tasks';

/**
 * Строит путь модального окна для открытия через react-router.
 * @param entity Сущность модального окна.
 * @param id Идентификатор сущности для режима редактирования (если не передан — режим создания).
 * @returns Путь модального окна.
 */
export const buildModalRoutePath = (entity: TModalRouteEntity, id?: string): string =>
    entity === 'auth' ? '/auth' : id ? `/${entity}/${id}` : `/${entity}/new`;
