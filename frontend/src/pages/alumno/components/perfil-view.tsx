import { Pencil, Star, User, Mail, ExternalLink, FileText } from 'lucide-react';
import { type AlumnoProfile } from '@/services/alumno';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface PerfilViewProps {
  profile: AlumnoProfile;
  userEmail?: string;
  onEdit: () => void;
}

export function PerfilView({ profile, userEmail, onEdit }: PerfilViewProps) {
  const initials =
    `${profile.nombre?.[0] ?? ''}${profile.apellido?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="space-y-5">
      {/* Profile Header Section */}
      <section>
        <div className="bg-card p-8 rounded-xl flex flex-col sm:flex-row gap-8 items-start relative overflow-hidden border border-border">
          <div className="relative z-10 w-25 h-25 md:w-40 md:h-40 shrink-0">
            <Avatar className="w-full h-full">
              <AvatarFallback className="text-3xl md:text-4xl bg-secondary text-primary font-black">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="relative z-10 grow">
            <div className="flex flex-col md:flex-row justify-between items-start">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-primary mb-1">
                  {profile.nombre} {profile.apellido}
                </h1>
                <p className="text-muted-foreground font-medium text-lg">
                  Estudiante de Ingeniería
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2 shrink-0 mt-4 md:mt-0"
                onClick={onEdit}
              >
                <Pencil className="size-4" />
                Editar perfil
              </Button>
            </div>

            <div className="flex gap-10 mt-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Legajo
                </p>
                <p className="text-foreground font-bold text-lg">
                  {profile.legajo}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Año
                </p>
                <p className="text-foreground font-bold text-lg">
                  {profile.anioEnCurso}° Nivel
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Bio + CV */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardContent className="px-8 py-6">
              <h2 className="text-2xl font-bold text-primary mb-4">
                Biografía Profesional
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                {profile.bio ? (
                  <p>{profile.bio}</p>
                ) : (
                  <p className="italic text-muted-foreground/60">
                    Aún no has cargado una biografía profesional.
                  </p>
                )}
              </div>

              {/* CV Section */}
              <div className="mt-10 bg-muted/30 p-5 rounded-xl flex flex-col md:flex-row items-center gap-6 border border-border/50">
                <div className="w-14 h-14 bg-primary text-primary-foreground flex items-center justify-center rounded-xl">
                  <FileText className="size-7" />
                </div>
                <div className="grow text-center md:text-left">
                  <h4 className="text-lg font-bold text-primary">
                    Curriculum Vitae
                  </h4>
                  {profile.cvUrl ? (
                    <p className="text-muted-foreground text-sm">
                      Enlace externo disponible
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">
                      Sin CV cargado
                    </p>
                  )}
                </div>
                {profile.cvUrl && (
                  <Button className="gap-2 shrink-0" asChild>
                    <a
                      href={profile.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" />
                      Ver CV
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Skills + Contact */}
        <aside className="lg:col-span-4 space-y-8 h-full">
          <Card className="h-full">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-primary flex items-center gap-2 mb-4">
                  <Star className="size-4" />
                  Habilidades
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.length > 0 ? (
                    profile.skills.map((skill) => (
                      <Badge
                        key={skill.id}
                        variant="secondary"
                        className="px-3 py-1 text-sm font-semibold"
                      >
                        {skill.nombre}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Sin habilidades registradas
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-bold text-primary flex items-center gap-2 mb-4">
                  <User className="size-4" />
                  Contacto
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm">
                    <Mail className="size-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      {profile.usuario?.email ?? userEmail}
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
