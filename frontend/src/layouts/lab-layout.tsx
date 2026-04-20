import { Outlet, NavLink } from 'react-router';
import { 
  LayoutDashboard, 
  FlaskConical, 
  PlusCircle, 
  Settings, 
  LogOut,
  ChevronUp,
  Moon,
  Sun,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuSeparator, 
  DropdownMenuSub, 
  DropdownMenuSubContent, 
  DropdownMenuSubTrigger, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function LabLayout() {
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  
  const initials = user
    ? (user.nombre?.[0] || user.email.charAt(0)).toUpperCase() + (user.apellido?.[0] || '').toUpperCase()
    : 'U';

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
              cn(
                'group flex items-center rounded-r-full px-6 py-3 transition-transform duration-200',
                isActive
                  ? 'bg-primary/10 font-bold text-primary'
                  : 'text-muted-foreground hover:translate-x-1 hover:bg-muted/50'
              )
            }
          >
            <LayoutDashboard className="mr-3 size-5" />
            <span className="text-sm">Panel General</span>
          </NavLink>

          {/* 
          <NavLink
            to="/responsable/laboratorio"
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                'group flex items-center rounded-r-full px-6 py-3 transition-transform duration-200',
                isActive
                  ? 'bg-primary/10 font-bold text-primary'
                  : 'text-muted-foreground hover:translate-x-1 hover:bg-muted/50'
              )
            }
          >
            <FlaskConical className="mr-3 size-5" />
            <span className="text-sm">Mi Laboratorio</span>
          </NavLink> 
          */}

          <NavLink
            to="/responsable/proyectos/nuevo"
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                'group flex items-center rounded-r-full px-6 py-3 transition-transform duration-200',
                isActive
                  ? 'bg-primary/10 font-bold text-primary'
                  : 'text-muted-foreground hover:translate-x-1 hover:bg-muted/50'
              )
            }
          >
            <PlusCircle className="mr-3 size-5" />
            <span className="text-sm">Crear Proyecto</span>
          </NavLink>
        </nav>

        <div className="mt-auto px-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="mx-2 mb-4 flex w-full items-center justify-between rounded-xl bg-card p-3 shadow-sm border border-border/40 hover:bg-muted/50 transition-colors text-left group">
                <div className="flex items-center overflow-hidden">
                  <Avatar className="size-9 ring-2 ring-primary/10">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3 overflow-hidden">
                    <p className="truncate text-xs font-bold leading-none">{user?.nombre || user?.email?.split('@')[0] || 'Responsable'}</p>
                    <p className="truncate text-[10px] text-muted-foreground mt-1">Responsable de Lab</p>
                  </div>
                </div>
                <ChevronUp className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56" sideOffset={10}>
              <DropdownMenuGroup>
                <DropdownMenuItem className="gap-2">
                  <User className="size-4" />
                  Mi perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Settings className="size-4" />
                  Configuración
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                  {resolvedTheme === 'dark' ? (
                    <Moon className="size-4" />
                  ) : (
                    <Sun className="size-4" />
                  )}
                  Tema
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={resolvedTheme}
                    onValueChange={setTheme}
                  >
                    <DropdownMenuRadioItem value="light">
                      <Sun className="mr-2 size-4" />
                      Claro
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <Moon className="mr-2 size-4" />
                      Oscuro
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" className="gap-2" onClick={logout}>
                <LogOut className="size-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="ml-64 w-full p-8 px-10">
        <Outlet />
      </main>
    </div>
  );
}


