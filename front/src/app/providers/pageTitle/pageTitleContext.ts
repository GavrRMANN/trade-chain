import { createContext } from 'react';

export type PageTitleContextValue = {
    title: string;
    subTitle?: string;
    setTitle: (title: string) => void;
    setSubTitle: (subTitle?: string) => void;
};

export const PageTitleContext = createContext<PageTitleContextValue | null>(null);
