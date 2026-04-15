import { Bell, ChevronDown } from 'lucide-react';
import { NavLink } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

function getInitials(email: string): string {
  const parts = email.split('@')[0].split('.');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

const navLinks = [
  { to: '/alumno/dashboard', label: 'Inicio' },
  { to: '/alumno/laboratorios', label: 'Laboratorios' },
  { to: '/alumno/postulaciones', label: 'Mis Postulaciones' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const initials = user ? getInitials(user.email) : '?';

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm shadow-nav border-b border-border/40">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6 max-w-5xl">
        {/* Logo + navegación */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-md bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground text-xs font-bold font-display">
                U
              </span>
            </div>
            <span className="font-display font-semibold text-sm hidden sm:block">
              Portal FRLP
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-0.5">
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

        {/* Acciones */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="relative">
            <Bell />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 px-2">
                <Avatar size="sm">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <ChevronDown className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuItem>Mi perfil</DropdownMenuItem>
                <DropdownMenuItem>Mis postulaciones</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={logout}>
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
