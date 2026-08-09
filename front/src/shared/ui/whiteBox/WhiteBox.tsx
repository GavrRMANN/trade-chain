import Styles from './WhiteBox.module.css';
import {useWhiteBox} from './useWhiteBox';

type TWhiteBoxProps = {
    title: string;
    active?: boolean;
    img?: string;
    disabled?: boolean;
    onClick?: () => void;
}

export const WhiteBox = ({title, active, img, disabled, onClick}: TWhiteBoxProps) => {
    const {className} = useWhiteBox({active, image: img, disabled});

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
                img && <img className={Styles.img} src={img} alt="" aria-hidden="true"/>
            }
        </button>
    )
};
