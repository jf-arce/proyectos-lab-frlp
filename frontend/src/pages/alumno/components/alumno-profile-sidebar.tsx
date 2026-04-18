import { User, FileText } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface AlumnoProfileSidebarProps {
  displayName: string;
  initials: string;
  email?: string;
}

export function AlumnoProfileSidebar({
  displayName,
  initials,
  email,
}: AlumnoProfileSidebarProps) {
  return (
    <aside className="lg:sticky top-20.25 self-start mb-0">
      <Card className="overflow-hidden shadow-card p-0">
        <div className="relative bg-primary h-16 overflow-hidden">
          <div className="absolute -left-8 -top-8 size-28 bg-primary-foreground opacity-5 rounded-full blur-2xl pointer-events-none" />
        </div>

        <CardContent className="pt-0 pb-5 px-4">
          <div className="-mt-8 mb-3">
            <Avatar className="w-16 h-16 border-4 border-card shadow-sm">
              <AvatarFallback className="bg-secondary text-primary font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-0.5 mb-4">
            <p className="font-display font-bold text-foreground leading-tight">
              {displayName}
            </p>
            <p className="text-muted-foreground text-xs truncate">{email}</p>

            <Separator className="my-2" />

            <p className="text-muted-foreground text-sm">
              Estudiante · 5to año
            </p>
            <p className="text-muted-foreground text-sm">
              Descripcion breve sobre el alumno, intereses y objetivos. Esto
              ayuda a los laboratorios a entender mejor el perfil del estudiante
              y recomendar proyectos más relevantes.
            </p>
          </div>

          <div className="border-t border-border my-4" />

          <nav className="space-y-0.5">
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start gap-2.5 font-medium h-9"
            >
              <Link to="/alumno/perfil">
                <User className="size-4 shrink-0" />
                Mi Perfil
              </Link>
            </Button>

            <div className="w-full justify-start items-center gap-2.5 font-medium h-9 flex px-3">
              <FileText className="size-4 shrink-0" />
              <p className="text-foreground text-sm leading-tight">
                Postulaciones activas:
              </p>
              <p className="text-primary font-bold text-sm leading-none">0</p>
            </div>
          </nav>
        </CardContent>
      </Card>
    </aside>
  );
}
