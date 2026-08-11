import Styles from './WhiteBox.module.css';
import {useWhiteBox} from './useWhiteBox';

type TWhiteBoxProps = {
    title: string;
    active?: boolean;
    icon?: string;
    img?: string;
    disabled?: boolean;
    onClick?: () => void;
}

export const WhiteBox = ({title, active, icon, img, disabled, onClick}: TWhiteBoxProps) => {
    const {className} = useWhiteBox({active, image: img ?? icon, disabled});

    return (
        <button
            className={className}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={onClick}
        >
            <h4 className={Styles.title}>
                {title}
            </h4>
            {
                icon
                    ? <span className={Styles.icon} aria-hidden="true">{icon}</span>
                    : img && <img className={Styles.img} src={img} alt="" aria-hidden="true"/>
            }
        </button>
    )
};
