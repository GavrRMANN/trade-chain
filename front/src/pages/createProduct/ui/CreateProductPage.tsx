import { MainSection } from '@shared/ui/mainSection';
import { Preloader } from '@shared/ui/preloader';
import { PageError } from '@shared/ui/pageError';
import { PageHeader } from '@shared/ui/pageHeader';
import { Button } from '@shared/ui/button';

import { ProductForm } from '@features/productForm';
import Styles from './create-product-page.module.css';
import { useCreateProductPage } from '../lib';

export const CreateProductPage = () => {
    const { form, title, goBack } = useCreateProductPage();

    if (form.isCategoriesError) {
        return <PageError message="Не удалось загрузить категории. Обновите страницу." />;
    }

    if (form.isCategoriesLoading && form.categories.length === 0) {
        return <Preloader message="Загружаем категории…" />;
    }

    if (form.isOwnerError) {
        return (
            <MainSection>
                <PageHeader title={title} />
                <section className={Styles['page__guest-card']}>
                    <h2>Это не ваше объявление</h2>
                    <p>Редактировать объявление может только его автор.</p>
                    <Button onClick={goBack}>Вернуться назад</Button>
                </section>
            </MainSection>
        );
    }

    if (form.isProductError) {
        return <PageError message="Не удалось загрузить объявление для редактирования." />;
    }

    if (form.isProductLoading || form.isFetchingUser) {
        return <Preloader message="Загружаем объявление…" />;
    }

    return (
        <MainSection>
            <PageHeader
                title={title}
                subTitle="Чем подробнее описание, тем быстрее найдётся обмен"
            />
            <div className={Styles.page}>
                <ProductForm
                    isEdit={form.isEdit}
                    categories={form.categories}
                    targetProducts={form.targetProducts}
                    currentCustomerId={form.currentCustomerId}
                    statusOptions={form.statusOptions}
                    title={form.title}
                    categoryId={form.categoryId}
                    description={form.description}
                    image={form.image}
                    price={form.price}
                    location={form.location}
                    status={form.status}
                    targetGoal={form.targetGoal}
                    errors={form.errors}
                    requestError={form.requestError}
                    isLoading={form.isLoading}
                    isTargetProductsLoading={form.isTargetProductsLoading}
                    isTargetProductsError={form.isTargetProductsError}
                    setTitle={form.setTitle}
                    setCategoryId={form.setCategoryId}
                    setDescription={form.setDescription}
                    setImage={form.setImage}
                    setPrice={form.setPrice}
                    setLocation={form.setLocation}
                    setStatus={form.setStatus}
                    setTargetGoal={form.setTargetGoal}
                    handleSubmit={form.handleSubmit}
                />
            </div>
        </MainSection>
    );
};
