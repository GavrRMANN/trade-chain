import { Button } from '@shared/ui/button';
import { ProductImage } from '@entities/product';

import type { TChainRoute } from '../lib';
import Styles from './chain-route-banner.module.css';

type TChainRouteBannerProps = {
    route: TChainRoute;
};

/**
 * Отметка о том, что сделка — звено цепочки обменов.
 *
 * Внутри комнаты обмен выглядит как самостоятельная сделка, хотя решение о
 * нём зависит от цели: отдать вещь по цепочке и отдать её просто так — разные
 * поступки. Поэтому цель показывается рядом со сделкой, а не только на
 * странице маршрута, и оттуда же ведёт переход ко всему пути.
 */
export const ChainRouteBanner = ({ route }: TChainRouteBannerProps) => {
    const { goalTitle, goalProduct, progressLabel, openRoute } = route;

    return (
        <section className={Styles['chain-route']} aria-label="Цепочка обменов">
            {goalProduct && (
                <div className={Styles['chain-route__media']}>
                    <ProductImage
                        src={goalProduct.image}
                        alt={goalProduct.title}
                        title={goalProduct.title}
                    />
                </div>
            )}

            <div className={Styles['chain-route__body']}>
                <span className={Styles['chain-route__label']}>Цепочка обменов</span>
                <strong className={Styles['chain-route__goal']}>Цель: {goalTitle}</strong>
                <span className={Styles['chain-route__progress']}>{progressLabel}</span>
            </div>

            {openRoute && (
                <Button
                    variant="secondary"
                    className={Styles['chain-route__action']}
                    onClick={openRoute}
                >
                    Открыть цепочку
                </Button>
            )}
        </section>
    );
};
