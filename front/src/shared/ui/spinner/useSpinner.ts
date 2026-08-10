import Styles from './Spinner.module.css';

export const useSpinner = ({size, className}: {size: 'sm' | 'md' | 'lg'; className?: string}) => ({
    className: [Styles.spinner, Styles[`spinner--${size}`], className].filter(Boolean).join(' '),
});
