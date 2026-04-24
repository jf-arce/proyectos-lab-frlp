import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  User, 
  Mail, 
  Download, 
  ArrowLeft,
  Star,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { alumnoService, type AlumnoProfile } from '@/services/alumno';
import { toast } from 'sonner';

export function AlumnoProfileView() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [alumno, setAlumno] = useState<AlumnoProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlumno = async () => {
      if (!id || !token) return;
      try {
        const data = await alumnoService.getById(id, token);
        setAlumno(data);
      } catch (error) {
        console.error('Error fetching alumno:', error);
        toast.error('No se pudo cargar el perfil del alumno');
      } finally {
        setLoading(false);
      }
    };
    fetchAlumno();
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!alumno) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Alumno no encontrado</p>
        <Button variant="link" onClick={() => navigate(-1)}>Volver atrás</Button>
      </div>
    );
  }

  const initials = `${alumno.nombre[0]}${alumno.apellido[0]}`.toUpperCase();

  return (
    <div className="max-w-screen-xl mx-auto space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="size-4" />
          Volver al Dashboard
        </Button>
      </div>

      {/* Profile Header Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Info Card - Expanded */}
        <div className="lg:col-span-12 bg-card p-8 rounded-xl flex flex-col md:flex-row gap-8 items-start relative overflow-hidden group border border-border shadow-sm">
          <div className="relative z-10 w-40 h-40 shrink-0">
            <Avatar className="w-full h-full rounded-xl shadow-md border-4 border-background">
              <AvatarFallback className="text-4xl bg-secondary text-primary font-black">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="relative z-10 flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-primary mb-1">
                  {alumno.nombre} {alumno.apellido}
                </h1>
                <p className="text-muted-foreground font-medium text-lg">
                  Estudiante de Ingeniería
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Legajo</p>
                <p className="text-foreground font-bold text-lg">{alumno.legajo}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Año</p>
                <p className="text-foreground font-bold text-lg">{alumno.anioEnCurso}° Nivel</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Estado</p>
                <p className="text-primary font-bold text-lg">Regular</p>
              </div>
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        </div>
      </section>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Skills/Contact */}
        <aside className="lg:col-span-4 space-y-8">
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-primary flex items-center gap-2 mb-4">
                  <Star className="size-4" />
                  Habilidades
                </h2>
                <div className="flex flex-wrap gap-2">
                  {alumno.skills.length > 0 ? (
                    alumno.skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary" className="px-3 py-1 text-sm font-semibold">
                        {skill.nombre}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sin habilidades registradas</p>
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
                    <span className="font-medium text-foreground">{alumno.usuario.email}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <Smartphone className="size-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">+54 221 444-5566</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Right Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Biografía Profesional</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                {alumno.bio ? (
                  <p>{alumno.bio}</p>
                ) : (
                  <p className="italic text-muted-foreground/60">
                    El alumno aún no ha proporcionado una biografía profesional.
                  </p>
                )}
              </div>

              {/* CV Download Section */}
              <div className="mt-12 bg-muted/30 p-8 rounded-xl flex flex-col md:flex-row items-center gap-6 border border-border/50">
                <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center rounded-xl">
                  <User className="size-8" />
                </div>
                <div className="flex-grow text-center md:text-left">
                  <h4 className="text-lg font-bold text-primary">Curriculum Vitae Académico</h4>
                  <p className="text-muted-foreground text-sm">Formato PDF actualizado</p>
                </div>
                <Button className="gap-2 shrink-0">
                  <Download className="size-4" />
                  Ver CV Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
