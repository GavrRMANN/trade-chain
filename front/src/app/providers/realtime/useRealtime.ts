import { useEffect, useRef } from 'react';

import { chainApi } from '@entities/chain';
import { notificationApi } from '@entities/notification/api';
import { productApi } from '@entities/product';
import { logout, selectAuthToken } from '@entities/user';
import { subscribeToEvents, type TSseEvent } from '@shared/api';
import { useAppDispatch, useAppSelector } from '@app/redux';

const RECONNECT_DELAY = 2_000;

/**
 * Пересобирает только то, что изменило событие.
 *
 * Раньше любое событие сбрасывало весь тег `Chain`, и одно сообщение в чате
 * тянуло за собой перезагрузку списка всех обменов на каждом открытом экране.
 * Состав списка меняют только появление и закрытие звена — переписка на него
 * не влияет.
 */
const invalidateByEvent = (event: TSseEvent, dispatch: ReturnType<typeof useAppDispatch>) => {
    if (event.type === 'exchange.message.created') {
        dispatch(chainApi.util.invalidateTags([{ type: 'ChainMessages', id: event.chain_id }]));
        dispatch(notificationApi.util.invalidateTags(['Notification']));
        return;
    }

    /* Появление и закрытие звена меняют состав сразу нескольких списков —
       общего, по цели и по товару, — поэтому тег сбрасывается целиком.
       События жизненного цикла редки, в отличие от переписки. */
    dispatch(
        chainApi.util.invalidateTags([
            'Chain',
            { type: 'Chain', id: event.chain_id },
            { type: 'ChainDetails', id: event.chain_id },
        ]),
    );
    dispatch(notificationApi.util.invalidateTags(['Notification']));

    // Состоявшийся обмен меняет владельцев и статусы карточек, поэтому здесь
    // сбрасывается весь каталог: затронутые товары событием не приходят.
    if (event.type === 'exchange.completed') {
        dispatch(productApi.util.invalidateTags(['Product']));
    }
};

/** Поддерживает SSE-подписку текущей сессии и синхронизирует кэш RTK Query. */
export const useRealtime = (onEvent?: (event: TSseEvent) => void) => {
    const dispatch = useAppDispatch();
    const token = useAppSelector(selectAuthToken);
    const onEventRef = useRef(onEvent);
    onEventRef.current = onEvent;

    useEffect(() => {
        if (!token) return;

        const controller = new AbortController();
        let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

        const connect = async () => {
            try {
                await subscribeToEvents(token, controller.signal, (event) => {
                    invalidateByEvent(event, dispatch);
                    onEventRef.current?.(event);
                });
            } catch (error) {
                if (String(error) === 'Error: 401') {
                    dispatch(logout());
                    return;
                }
            }

            if (!controller.signal.aborted) {
                reconnectTimer = setTimeout(connect, RECONNECT_DELAY);
            }
        };

        void connect();

        return () => {
            controller.abort();
            if (reconnectTimer) clearTimeout(reconnectTimer);
        };
    }, [dispatch, token]);
};
