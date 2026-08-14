import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductForm } from './ProductForm';

const categories = [
    {
        category_id: 'electronics',
        name: 'Электроника',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
    },
];
const meta = {
    title: 'Features/ProductForm',
    component: ProductForm,
    args: {
        isEdit: false,
        categories,
        targetProducts: [],
        currentCustomerId: 'user-1',
        statusOptions: [
            { value: 'active', label: 'Активно' },
            { value: 'archived', label: 'В архиве' },
        ],
        title: 'Игровая приставка',
        categoryId: 'electronics',
        description: 'Хорошее состояние.',
        image: '',
        price: '13 990',
        location: 'Москва',
        status: 'active',
        targetGoal: {},
        errors: {},
        isLoading: false,
        isTargetProductsLoading: false,
        isTargetProductsError: false,
        requestError: undefined,
        setTitle: () => undefined,
        setCategoryId: () => undefined,
        setDescription: () => undefined,
        setImage: () => undefined,
        setPrice: () => undefined,
        setLocation: () => undefined,
        setStatus: () => undefined,
        setTargetGoal: () => undefined,
        handleSubmit: (event) => event.preventDefault(),
    },
} satisfies Meta<typeof ProductForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Create: Story = {};
export const EditWithImage: Story = {
    args: {
        isEdit: true,
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=480',
    },
};
export const ValidationError: Story = {
    args: {
        title: '',
        categoryId: '',
        description: '',
        price: '',
        errors: {
            title: 'Введите название',
            categoryId: 'Выберите категорию',
            description: 'Добавьте описание',
        },
    },
};
export const Loading: Story = { args: { isLoading: true } };
export const RequestError: Story = { args: { requestError: 'Не удалось сохранить объявление' } };
