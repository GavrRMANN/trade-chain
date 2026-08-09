import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';

import Styles from './MessageInput.module.css';

type TUseMessageInputParams = {
    value: string;
    disabled: boolean;
    loading: boolean;
    className?: string;
    onChange: (value: string) => void;
    onSend: () => void;
};

export const useMessageInput = ({
    value,
    disabled,
    loading,
    className,
    onChange,
    onSend,
}: TUseMessageInputParams) => {
    const canSend = value.trim().length > 0 && !disabled && !loading;
    const formClasses = [Styles['message-input'], className].filter(Boolean).join(' ');
    const sendMessage = () => {
        if (canSend) {
            onSend();
        }
    };
    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value);
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        sendMessage();
    };
    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    return { canSend, formClasses, handleChange, handleSubmit, handleKeyDown };
};
