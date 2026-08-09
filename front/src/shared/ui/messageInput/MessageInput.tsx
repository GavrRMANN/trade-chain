import {Button} from '@shared/ui/button';

import Styles from './MessageInput.module.css';
import {useMessageInput} from './useMessageInput';

type TMessageInputProps = {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    disabled?: boolean;
    loading?: boolean;
    placeholder?: string;
    className?: string;
};

export const MessageInput = ({
    value,
    onChange,
    onSend,
    disabled = false,
    loading = false,
    placeholder,
    className,
}: TMessageInputProps) => {
    const {canSend, formClasses, handleChange, handleSubmit, handleKeyDown} = useMessageInput({
        value, disabled, loading, className, onChange, onSend,
    });

    return (
        <form className={formClasses} onSubmit={handleSubmit}>
            <textarea
                className={Styles['message-input__field']}
                value={value}
                placeholder={placeholder}
                rows={1}
                disabled={disabled || loading}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />

            <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={!canSend}
                className={Styles['message-input__submit']}
            >
                Отправить
            </Button>
        </form>
    );
};
