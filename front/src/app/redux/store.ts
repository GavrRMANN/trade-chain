import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { categoryApi } from '@/entities/category';
import { chainApi } from '@/entities/chain';
import { customerApi } from '@/entities/customer';
import { productApi } from '@/entities/product';
import { reviewApi } from '@/entities/review';
import { searchApi } from '@/entities/search';
import { userSlice, userApi } from '@/entities/user';
import { wishlistApi } from '@/entities/wishlist';
import { rtkQueryAuthMiddleware } from './middleware';

export const store = configureStore({
    reducer: {
        user: userSlice.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [productApi.reducerPath]: productApi.reducer,
        [categoryApi.reducerPath]: categoryApi.reducer,
        [chainApi.reducerPath]: chainApi.reducer,
        [customerApi.reducerPath]: customerApi.reducer,
        [reviewApi.reducerPath]: reviewApi.reducer,
        [searchApi.reducerPath]: searchApi.reducer,
        [wishlistApi.reducerPath]: wishlistApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(
                rtkQueryAuthMiddleware,
                userApi.middleware,
                productApi.middleware,
                categoryApi.middleware,
                chainApi.middleware,
                customerApi.middleware,
                reviewApi.middleware,
                searchApi.middleware,
                wishlistApi.middleware,
            ),
});

export type TRootState = ReturnType<typeof store.getState>;
export type TAppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<TAppDispatch>();
export const useAppSelector: TypedUseSelectorHook<TRootState> = useSelector;
