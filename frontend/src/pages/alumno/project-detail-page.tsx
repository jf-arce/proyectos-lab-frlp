import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, Clock, FlaskConical, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { projectsService } from '@/services/projects';
import type { ProjectDetail, MyApplication } from '@/types/projects';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkillTag } from '@/components/ui/skill-tag';
import { ProjectDetailSkeleton } from './components/project-detail-skeleton';
import { ProjectActionCard } from './components/project-action-card';

export function ProjectDetailPage() {
  const { token } = useAuth();
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (!token || !id) return;

    setIsLoading(true);
    setError(null);

    Promise.all([
      projectsService.findById(token, id),
      projectsService.getMyApplications(token),
    ])
      .then(([proj, myApps]: [ProjectDetail, MyApplication[]]) => {
        setProject(proj);
        setHasApplied(myApps.some((a) => a.proyecto.id === id));
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : 'Error al cargar el proyecto',
        );
      })
      .finally(() => setIsLoading(false));
  }, [token, id]);

  async function handleApply() {
    if (!token || !id) return;
    setIsApplying(true);
    try {
      await projectsService.applyToProject(token, id);
      setHasApplied(true);
      toast.success('¡Postulación enviada exitosamente!');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al enviar la postulación',
      );
    } finally {
      setIsApplying(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-40 rounded bg-muted animate-pulse" />
        <ProjectDetailSkeleton />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <p className="text-destructive text-lg font-medium">
          {error ?? 'Proyecto no encontrado'}
        </p>
        <Button variant="outline" asChild>
          <Link to="/alumno/dashboard">
            <ArrowLeft className="size-4 mr-2" />
            Volver al inicio
          </Link>
        </Button>
      </div>
    );
  }

  const isClosed = project.estado === 'CERRADO';

  return (
    <div className="space-y-6">
      <Link
        to="/alumno/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Volver a proyectos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left column ── */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant={isClosed ? 'destructive' : 'default'}>
                  {isClosed ? 'Cerrado' : 'Investigación Activa'}
                </Badge>
                {project.duracion && (
                  <Badge variant="secondary" className="gap-1 bg-orange-200">
                    <Clock className="size-3" />
                    {project.duracion} de duración
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight tracking-tight">
                {project.titulo}
              </h1>

              <p className="text-muted-foreground leading-relaxed text-base">
                {project.descripcion}
              </p>

              {project.skills.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Habilidades requeridas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill) => (
                      <SkillTag key={skill.id}>{skill.nombre}</SkillTag>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FlaskConical className="size-4 text-primary" />
                Laboratorio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-semibold text-foreground">
                {project.laboratorio.nombre}
              </p>
              {project.laboratorio.descripcion && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {project.laboratorio.descripcion}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right sidebar ── */}
        <div className="lg:col-span-4 sticky flex flex-col justify-between top-24 space-y-4 h-full">
          <ProjectActionCard
            cupos={project.cupos}
            createdAt={project.createdAt}
            isClosed={isClosed}
            hasApplied={hasApplied}
            isApplying={isApplying}
            fechaCierre={project.fechaCierre}
            onApply={handleApply}
          />

          {project.laboratorio.emailContacto && (
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="space-y-2">
                <p className="font-semibold text-sm">¿Consultas técnicas?</p>
                <p className="text-xs opacity-80">
                  Contactá al equipo del laboratorio para resolver dudas sobre
                  el proyecto.
                </p>
                <a
                  href={`mailto:${project.laboratorio.emailContacto}`}
                  className="inline-flex items-center gap-1.5 text-sm font-bold hover:underline mt-1"
                >
                  <Mail className="size-3.5" />
                  {project.laboratorio.emailContacto}
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
