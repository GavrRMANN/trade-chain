import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

import Styles from './main-layout.module.css';

type MainLayoutProps = {
  children?: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <main className={Styles.layout}>
      {children ?? <Outlet />}
    </main>
  );
}
