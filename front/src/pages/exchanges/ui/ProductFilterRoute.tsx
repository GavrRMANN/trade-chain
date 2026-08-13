import {useNavigate, useSearchParams} from 'react-router-dom';

import {Button} from '@shared/ui/button';
import {Modal} from '@shared/ui/modal';
import {ProductPickerGrid} from '@shared/ui/productPicker';
import {useCloseModalRoute} from '@shared/lib';

import {getFilterableProducts, isExchangeTab, useExchangeRows} from '../lib';
import Styles from './product-filter-modal.module.css';

/**
 * Выбор товара для фильтра входящих/исходящих предложений — маршрут
 * `/exchanges/filter`.
 *
 * Вкладка и текущий фильтр приходят в query самого маршрута: окно должно
 * показывать ровно те товары, по которым фильтруется список под ним, и при
 * прямом заходе по ссылке ему неоткуда взять это из состояния страницы.
 */
export const ProductFilterRoute = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const tab = searchParams.get('tab');
    const activeTab = isExchangeTab(tab) ? tab : 'active';
    const selectedProductId = searchParams.get('product') ?? undefined;

    const closeModal = useCloseModalRoute(`/exchanges?${searchParams.toString()}`);
    const {incoming, outgoing} = useExchangeRows();
    const products = getFilterableProducts(activeTab, {incoming, outgoing});

    /* Выбор — это и есть закрытие: страница обменов держит фильтр в query,
       поэтому возвращаемся на неё уже с новым значением. */
    const selectProduct = (productId: string | null) => {
        const params = new URLSearchParams(searchParams);

        if (productId) {
            params.set('product', productId);
        } else {
            params.delete('product');
        }

        navigate(`/exchanges?${params.toString()}`, {replace: true});
    };

    return (
        <Modal
            title={activeTab === 'incoming' ? 'Товар из входящих' : 'Товар из исходящих'}
            isOpen
            onClose={closeModal}
        >
            <div className={Styles.filter}>
                <Button
                    variant={selectedProductId ? 'secondary' : 'primary'}
                    onClick={() => selectProduct(null)}
                >
                    Все товары
                </Button>
                {products.length > 0 && (
                    <ProductPickerGrid
                        products={products}
                        selectedProductId={selectedProductId}
                        onSelect={selectProduct}
                    />
                )}
            </div>
        </Modal>
    );
};
