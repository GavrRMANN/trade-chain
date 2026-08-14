import type { SVGProps } from 'react';

type TBellIconProps = Pick<SVGProps<SVGSVGElement>, 'className'>;

export const BellIcon = ({ className }: TBellIconProps) => (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 9A6 6 0 0 0 6 9c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </svg>
);
