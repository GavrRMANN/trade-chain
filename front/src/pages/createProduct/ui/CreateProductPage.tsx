import {MainSection} from '@shared/ui/mainSection';
import {Preloader} from '@shared/ui/preloader';
import {PageError} from '@shared/ui/pageError';
import {Button} from '@shared/ui/button';

import {ProductForm} from '@features/productForm';
import Styles from './create-product-page.module.css';
import {useCreateProductPage} from '../lib';

export const CreateProductPage = () => {
    const {form, openAuth, goBack} = useCreateProductPage();

    // Режим редактирования требует авторизованного пользователя.
    if (form.isEdit && !form.isAuthenticated) {
        return (
            <MainSection>
                <section className={Styles["page__guest-card"]}>
                    <h2>Войдите, чтобы редактировать объявление</h2>
                    <p>Редактировать объявления могут только их авторы.</p>
                    <Button onClick={openAuth}>Войти или зарегистрироваться</Button>
                </section>
            </MainSection>
        );
    }

    // Сценарий создания тоже требует авторизации.
    if (!form.isEdit && !form.isAuthenticated) {
        return (
            <MainSection>
                <section className={Styles["page__guest-card"]}>
                    <h2>Войдите, чтобы добавить вещь</h2>
                    <p>Публикация объявлений доступна только авторизованным пользователям.</p>
                    <Button onClick={openAuth}>Войти или зарегистрироваться</Button>
                </section>
            </MainSection>
        );
    }

    if (form.isCategoriesError) {
        return <PageError message="Не удалось загрузить категории. Обновите страницу." />;
    }

    if (form.isCategoriesLoading && form.categories.length === 0) {
        return <Preloader message="Загружаем категории…" />;
    }

    if (form.isOwnerError) {
        return (
            <MainSection>
                <section className={Styles["page__guest-card"]}>
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
            <div className={Styles.page}>
                <ProductForm
                    isEdit={form.isEdit}
                    categories={form.categories}
                    statusOptions={form.statusOptions}
                    title={form.title}
                    categoryId={form.categoryId}
                    description={form.description}
                    image={form.image}
                    price={form.price}
                    location={form.location}
                    status={form.status}
                    errors={form.errors}
                    requestError={form.requestError}
                    isLoading={form.isLoading}
                    setTitle={form.setTitle}
                    setCategoryId={form.setCategoryId}
                    setDescription={form.setDescription}
                    setImage={form.setImage}
                    setPrice={form.setPrice}
                    setLocation={form.setLocation}
                    setStatus={form.setStatus}
                    handleSubmit={form.handleSubmit}
                />
            </div>
        </MainSection>
    );
};
