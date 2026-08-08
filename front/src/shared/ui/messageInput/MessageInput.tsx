import {type FormEvent, type KeyboardEvent} from 'react';

import {Button} from '@shared/ui/button';

import Styles from './MessageInput.module.css';

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
    const canSend = value.trim().length > 0 && !disabled && !loading;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (canSend) {
            onSend();
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();

            if (canSend) {
                onSend();
            }
        }
    };

    const formClasses = [
        Styles['message-input'],
        className,
    ].filter(Boolean).join(' ');

    return (
        <form className={formClasses} onSubmit={handleSubmit}>
            <textarea
                className={Styles['message-input__field']}
                value={value}
                placeholder={placeholder}
                rows={1}
                disabled={disabled || loading}
                onChange={(event) => onChange(event.target.value)}
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
