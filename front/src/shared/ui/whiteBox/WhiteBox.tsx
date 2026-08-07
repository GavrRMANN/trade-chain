import Styles from './WhiteBox.module.css';

type TWhiteBoxProps = {
    title: string;
    active?: boolean;
    img?: string;
    disabled?: boolean;
}

export const WhiteBox = ({title, active, img, disabled}: TWhiteBoxProps) => {
    const whiteBoxClasses = [
        Styles['white-box'],
        active && Styles['white-box--active'],
        !img && Styles['white-box--title'],
        disabled && Styles['white-box--disabled'],
    ].filter(Boolean).join(' ');

    const titleClasses = [
        Styles['title'],
        img && Styles['left'],
    ].filter(Boolean).join(' ');

    const imgClasses = [
        Styles['img'],
        img && Styles['right'],
    ].filter(Boolean).join(' ');

    return (
        <div className={whiteBoxClasses}>
            <h4 className={titleClasses}>
                Белый бокс
            </h4>
            {
                img && <img className={imgClasses} src={img} alt={title}/>
            }
        </div>
    )
};
