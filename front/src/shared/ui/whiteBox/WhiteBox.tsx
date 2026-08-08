import Styles from './WhiteBox.module.css';

type TWhiteBoxProps = {
    title: string;
    active?: boolean;
    img?: string;
    disabled?: boolean;
    onClick?: () => void;
}

export const WhiteBox = ({title, active, img, disabled, onClick}: TWhiteBoxProps) => {
    const whiteBoxClasses = [
        Styles['white-box'],
        active && Styles['white-box--active'],
        !img && Styles['white-box--without-image'],
        disabled && Styles['white-box--disabled'],
    ].filter(Boolean).join(' ');

    return (
        <button
            className={whiteBoxClasses}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={onClick}
        >
            <h4 className={Styles.title}>
                {title}
            </h4>
            {
                img && <img className={Styles.img} src={img} alt="" aria-hidden="true"/>
            }
        </button>
    )
};
