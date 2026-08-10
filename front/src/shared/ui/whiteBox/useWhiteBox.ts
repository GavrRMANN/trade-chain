import Styles from './WhiteBox.module.css';

export const useWhiteBox = ({active, image, disabled}: {active?: boolean; image?: string; disabled?: boolean}) => ({
    className: [
        Styles['white-box'],
        active && Styles['white-box--active'],
        !image && Styles['white-box--without-image'],
        disabled && Styles['white-box--disabled'],
    ].filter(Boolean).join(' '),
});
