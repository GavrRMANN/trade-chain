import {createContext, useContext, useState, type PropsWithChildren} from 'react';

type PageTitleContextValue = {
    title: string;
    setTitle: (title: string) => void;
};

const PageTitleContext = createContext<PageTitleContextValue | null>(null);

export const PageTitleProvider = ({children}: PropsWithChildren) => {
    const [title, setTitle] = useState('');

    return (
        <PageTitleContext.Provider value={{title, setTitle}}>
            {children}
        </PageTitleContext.Provider>
    );
};

export const usePageTitle = () => {
    const context = useContext(PageTitleContext);

    if (!context) {
        throw new Error('usePageTitle должен использоваться внутри PageTitleProvider');
    }

    return context;
};