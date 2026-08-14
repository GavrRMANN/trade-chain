import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MessageInput } from './MessageInput';

const meta = {
    title: 'Shared/MessageInput',
    component: MessageInput,
    args: { value: '', onChange: () => undefined, onSend: () => undefined },
} satisfies Meta<typeof MessageInput>;
export default meta;
type Story = StoryObj<typeof meta>;
const Example = (props: Partial<React.ComponentProps<typeof MessageInput>>) => {
    const [value, setValue] = useState(props.value ?? '');
    return (
        <MessageInput
            value={value}
            onChange={setValue}
            onSend={() => setValue('')}
            placeholder="Напишите сообщение"
            {...props}
        />
    );
};
export const Empty: Story = { args: { value: '' }, render: () => <Example /> };
export const Filled: Story = {
    args: { value: 'Готов встретиться завтра' },
    render: () => <Example value="Готов встретиться завтра" />,
};
export const Loading: Story = {
    args: { value: 'Отправляем…', loading: true },
    render: () => <Example value="Отправляем…" loading />,
};
export const Disabled: Story = {
    args: { value: 'Сообщение недоступно', disabled: true },
    render: () => <Example value="Сообщение недоступно" disabled />,
};
