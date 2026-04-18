import { Outlet, NavLink } from 'react-router';
import { useAuth } from '@/hooks/use-auth';

export function LabLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-background text-foreground min-h-screen flex">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-muted/30 py-6 pr-4 border-r border-border">
        <div className="mb-10 px-6">
          <h1 className="text-lg font-black tracking-tight text-primary">Gestión Lab</h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Modo Responsable
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          <NavLink
            to="/responsable/dashboard"
            className={({ isActive }: { isActive: boolean }) =>
              `group flex items-center rounded-r-full px-6 py-3 transition-transform duration-200 ${
                isActive
                  ? 'bg-primary/10 font-bold text-primary'
                  : 'text-muted-foreground hover:translate-x-1 hover:bg-muted/50'
              }`
            }
          >
            <span className="material-symbols-outlined mr-3">dashboard</span>
            <span className="text-sm">Panel General</span>
          </NavLink>

          <NavLink
            to="/responsable/laboratorio"
            className={({ isActive }: { isActive: boolean }) =>
              `group flex items-center rounded-r-full px-6 py-3 transition-transform duration-200 ${
                isActive
                  ? 'bg-primary/10 font-bold text-primary'
                  : 'text-muted-foreground hover:translate-x-1 hover:bg-muted/50'
              }`
            }
          >
            <span className="material-symbols-outlined mr-3">biotech</span>
            <span className="text-sm">Mi Laboratorio</span>
          </NavLink>

          <button className="group flex w-full items-center rounded-r-full px-6 py-3 text-muted-foreground transition-transform duration-200 hover:translate-x-1 hover:bg-muted/50">
            <span className="material-symbols-outlined mr-3">add_circle</span>
            <span className="text-sm">Crear Proyecto</span>
          </button>
        </nav>

        <div className="mt-auto space-y-1 px-2">
          <div className="mx-2 mb-4 flex items-center rounded-xl bg-card p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold uppercase text-primary">
              {user?.email?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="truncate text-sm font-semibold">{user?.email?.split('@')[0] || 'Usuario'}</p>
              <p className="truncate text-xs text-muted-foreground">Responsable de Lab</p>
            </div>
          </div>

          <button className="group flex w-full items-center rounded-r-full px-6 py-2 text-muted-foreground transition-transform duration-200 hover:translate-x-1 hover:bg-muted/50">
            <span className="material-symbols-outlined mr-3">settings</span>
            <span className="text-sm">Configuración</span>
          </button>

          <button
            onClick={logout}
            className="group flex w-full items-center rounded-r-full px-6 py-2 text-destructive transition-transform duration-200 hover:translate-x-1 hover:bg-destructive/10"
          >
            <span className="material-symbols-outlined mr-3">logout</span>
            <span className="text-sm">Salir</span>
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="ml-64 w-full p-8">
        <Outlet />
      </main>
    </div>
  );
}
