import { Outlet } from 'react-router-dom';

export function MainLayout() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <Outlet />
    </main>
  );
}
