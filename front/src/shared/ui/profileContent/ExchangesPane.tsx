import type {TProfileExchange} from '@pages/profile/lib/useProfile';
import {ExchangeRow} from '@shared/ui/exchangeRow';
import {Empty} from 'antd';

import Styles from './profileContent.module.css';

type TExchangesPaneProps = {
    exchanges: TProfileExchange[];
    onOpen: (chainId: string) => void;
};

/** История обменов пользователя. */
export const ExchangesPane = ({exchanges, onOpen}: TExchangesPaneProps) => {
    if (exchanges.length === 0) {
        return (
            <div className={Styles.empty}>
                <Empty description="История обменов пуста"/>
            </div>
        );
    }
    return (
        <div className={Styles.paneList}>
            {exchanges.map((exchange) => (
                <ExchangeRow key={exchange.chain.chain_id} row={exchange} onOpen={onOpen}/>
            ))}
        </div>
    );
};
