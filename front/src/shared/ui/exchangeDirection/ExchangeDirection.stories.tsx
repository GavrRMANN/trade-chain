import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExchangeDirection } from './ExchangeDirection';

const meta = { title: 'Shared/ExchangeDirection', component: ExchangeDirection } satisfies Meta<typeof ExchangeDirection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
