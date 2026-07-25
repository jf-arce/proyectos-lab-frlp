import { ChevronDown, Moon, Sun, UserPlus } from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { Button } from '@/components/ui/button';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { AddResponsableDialog } from '@/pages/responsable/components/add-responsable-dialog';
import { NotificationsDropdown } from '@/components/notifications-dropdown';
import { Role } from '@/types/auth';

const alumnoNavLinks = [
  { to: '/alumno/dashboard', label: 'Inicio' },
  { to: '/alumno/laboratorios', label: 'Laboratorios' },
  { to: '/alumno/postulaciones', label: 'Mis Postulaciones' },
];

const responsableNavLinks = [
  { to: '/responsable/dashboard', label: 'Inicio' },
  { to: '/responsable/proyectos', label: 'Mis Proyectos' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [isAddResponsableOpen, setIsAddResponsableOpen] = useState(false);
  const initials = user
    ? (user.nombre[0] + user.apellido[0]).toUpperCase()
    : '?';

  // Determinar rol del usuario
  const isAlumno = user?.role === Role.ALUMNO;
  const isResponsable = user?.role === Role.RESPONSABLE_LABORATORIO;

  // No mostrar navbar si es alumno en onboarding
  // Nota: Para alumnos, el onboarding se detecta cuando no tienen perfil completo
  // Por ahora asumimos que si tienen usuario, completaron el onboarding
  if (!user) return;

  // Seleccionar links según el rol
  const navLinks = isAlumno ? alumnoNavLinks : isResponsable ? responsableNavLinks : [];

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm shadow-nav border-b border-border/40">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6 max-w-275 xl:max-w-6xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <picture>
              <img
                src="/images/utn-logo.png"
                alt="Logo de UTN FRLP"
                className="h-8 w-auto dark:invert invert-0"
              />
            </picture>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    'px-3 py-1.5 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <NotificationsDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 px-2 py-4 focus-visible:ring-0"
              >
                <Avatar size="sm">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <ChevronDown className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <Link to="/alumno/perfil">
                  <DropdownMenuItem>Mi perfil</DropdownMenuItem>
                </Link>
                <Link to="/alumno/postulaciones">
                  <DropdownMenuItem>Mis postulaciones</DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={() => setIsAddResponsableOpen(true)}>
                  <UserPlus className="mr-2 size-4" />
                  Agregar responsable
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {resolvedTheme === 'dark' ? (
                    <Moon key="moon" className="mr-2 size-4" />
                  ) : (
                    <Sun key="sun" className="mr-2 size-4" />
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
              <DropdownMenuItem variant="destructive" onClick={logout}>
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <AddResponsableDialog
        open={isAddResponsableOpen}
        onOpenChange={setIsAddResponsableOpen}
      />
    </header>
  );
}
