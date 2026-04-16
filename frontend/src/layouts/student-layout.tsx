import { Outlet } from 'react-router';
import { Navbar } from '@/layouts/navbar';
import { Main } from '@/components/main';

export function StudentLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Main>
        <Outlet />
      </Main>
    </div>
  );
}
