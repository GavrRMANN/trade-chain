import { useState, type PropsWithChildren } from 'react';

import { PageTitleContext } from './pageTitleContext';

export const PageTitleProvider = ({children}: PropsWithChildren) => {
    const [title, setTitle] = useState('');
    const [subTitle, setSubTitle] = useState<string>();

    return (
        <PageTitleContext.Provider value={{title, subTitle, setTitle, setSubTitle}}>
            {children}
        </PageTitleContext.Provider>
    );
};
