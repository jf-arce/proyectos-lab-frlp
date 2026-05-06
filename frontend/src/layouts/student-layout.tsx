import { Outlet } from 'react-router';
import { Navbar } from '@/layouts/navbar';
import { Main } from '@/components/main';
import { PerfilProvider } from '@/context/perfil-context';

export function StudentLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Main>
        <PerfilProvider>
          <Outlet />
        </PerfilProvider>
      </Main>
    </div>
  );
}
