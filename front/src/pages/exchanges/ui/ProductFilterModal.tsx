import {Button} from '@shared/ui/button';
import {Modal} from '@shared/ui/modal';
import {ProductPickerGrid} from '@shared/ui/productPicker';
import type {TProduct} from '@entities/product';

import Styles from './product-filter-modal.module.css';

type TProductFilterModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    products: TProduct[];
    selectedProductId?: string;
    onSelect: (productId: string | null) => void;
};

export const ProductFilterModal = ({
    isOpen,
    onClose,
    title,
    products,
    selectedProductId,
    onSelect,
}: TProductFilterModalProps) => (
    <Modal title={title} isOpen={isOpen} onClose={onClose}>
        <div className={Styles.filter}>
            <Button
                variant={selectedProductId ? 'secondary' : 'primary'}
                onClick={() => {
                    onSelect(null);
                    onClose();
                }}
            >
                Все товары
            </Button>
            {products.length > 0 && (
                <ProductPickerGrid
                    products={products}
                    selectedProductId={selectedProductId}
                    onSelect={(productId) => {
                        onSelect(productId);
                        onClose();
                    }}
                />
            )}
        </div>
    </Modal>
);
