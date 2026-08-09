import Styles from './ChainStatusBadge.module.css';
import { statusLabels, statusTone } from './chainStatusBadge.constants';
import type { TChainStatus } from '../../types';

export type TChainStatusBadgeStatus = TChainStatus;

export type TChainStatusBadgeTone =
    | 'pending'
    | 'active'
    | 'completed'
    | 'negative'
    | 'warning'
    | 'muted';

type TChainStatusBadgeProps = {
    status: TChainStatus;
    className?: string;
};

export const ChainStatusBadge = ({status, className}: TChainStatusBadgeProps) => {
    const classes = [
        Styles['status-badge'],
        Styles[`status-badge--${statusTone[status]}`],
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            {statusLabels[status]}
        </span>
    );
};
