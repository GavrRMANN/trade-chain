import Styles from './pageError.module.css';

type TPageErrorProps = {
  message: string;  
};

export const PageError = ({message}: TPageErrorProps) => {
    
    return (
        <div className={Styles['page-error']}>
            <h2 aria-label={message}>{message}</h2>
        </div>
    )
};