import { Button } from '@shared/ui/button';

import Styles from './profile-content.module.css';

type TEmptyStateProps = {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
};

export const EmptyState = ({ title, description, actionLabel, onAction }: TEmptyStateProps) => (
    <div className={Styles.empty}>
        <div>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
        {actionLabel && onAction && (
            <Button variant="secondary" onClick={onAction}>
                {actionLabel}
            </Button>
        )}
    </div>
);
