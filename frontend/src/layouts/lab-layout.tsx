import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router';
import { 
  LayoutDashboard, 
  PlusCircle, 
  LogOut,
  ChevronUp,
  Moon,
  Sun,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { responsableService } from '@/services/responsable';
import { UserPlus } from 'lucide-react';
import { AddResponsableDialog } from '@/pages/responsable/components/add-responsable-dialog';
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
  const { user, token, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [labName, setLabName] = useState<string>('');
  const [isAddResponsableOpen, setIsAddResponsableOpen] = useState(false);
  
  useEffect(() => {
    const fetchLabName = async () => {
      if (!token) return;
      try {
        const profile = await responsableService.getProfile(token);
        setLabName(profile.laboratorio.nombre);
      } catch (error) {
        console.error('Error fetching responsable profile:', error);
      }
    };
    fetchLabName();
  }, [token]);

  const initials = user
    ? (user.nombre?.[0] || user.email.charAt(0)).toUpperCase() + (user.apellido?.[0] || '').toUpperCase()
    : 'U';

  return (
    <div className="bg-background text-foreground min-h-screen flex">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-muted/30 py-6 pr-4 border-r border-border">
        <div className="mb-10 px-6">
          <h1 className="text-2xl font-black tracking-tighter text-primary leading-tight">
            {labName || 'Gestión Lab'}
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
            Laboratorio de Investigación
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
                <DropdownMenuItem className="gap-2" onClick={() => setIsAddResponsableOpen(true)}>
                  <UserPlus className="size-4" />
                  Agregar responsable
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
      <AddResponsableDialog 
        open={isAddResponsableOpen} 
        onOpenChange={setIsAddResponsableOpen} 
      />
    </div>
  );
}


