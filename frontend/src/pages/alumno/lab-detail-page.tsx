import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { laboratoriosService } from '@/services/laboratorios';
import { projectsService } from '@/services/projects';
import type { Laboratorio } from '@/types/laboratorios';
import type { ExploreProject } from '@/types/projects';
import { LabMonogram } from './components/lab-monogram';
import { ProjectCardExplore } from './components/project-card-explore';

const PREVIEW_SIZE = 3;

export function LaboratorioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const [lab, setLab] = useState<Laboratorio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [previewProjects, setPreviewProjects] = useState<ExploreProject[]>([]);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    if (!id) return;
    laboratoriosService
      .findOne(id)
      .then((data) => {
        setLab(data);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : 'Error al cargar el laboratorio',
        );
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (!token || !lab) return;
    projectsService
      .findAll(token, { lab: lab.nombre, limit: PREVIEW_SIZE, offset: 0 })
      .then(({ data, total }) => {
        setPreviewProjects(data);
        setPreviewTotal(total);
      })
      .catch(() => setPreviewFailed(true))
      .finally(() => setIsLoadingPreview(false));
  }, [token, lab]);

  return (
    <div className="flex flex-col gap-8">
      <Link
        to="/alumno/laboratorios"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-4" />
        Laboratorios
      </Link>

      {isLoading && <div className="h-72 rounded-2xl bg-muted animate-pulse" />}

      {!isLoading && error && (
        <p className="text-sm text-destructive text-center py-12">{error}</p>
      )}

      {!isLoading && !error && lab && (
        <>
          <section className="rounded-2xl bg-primary text-primary-foreground p-8 md:p-12 shadow-card">
            <div className="flex flex-col gap-6 max-w-3xl">
              <div className="flex items-center gap-4">
                <LabMonogram
                  nombre={lab.nombre}
                  variant="onPrimary"
                  size="lg"
                />
                <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70">
                  Laboratorio
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight leading-tight">
                {lab.nombre}
              </h1>

              <p className="text-base md:text-lg text-primary-foreground/80 leading-relaxed">
                {lab.descripcion}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                <Button asChild variant="secondary" size="lg">
                  <Link to={`/alumno/laboratorios/${lab.id}/proyectos`}>
                    Ver proyectos
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>

                {lab.emailContacto && (
                  <a
                    href={`mailto:${lab.emailContacto}`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    <Mail className="size-4" />
                    {lab.emailContacto}
                  </a>
                )}
              </div>
            </div>
          </section>

          {!previewFailed && (
            <section>
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Proyectos activos
                  {!isLoadingPreview && ` (${previewTotal})`}
                </h2>
                {!isLoadingPreview && previewTotal > 0 && (
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/alumno/laboratorios/${lab.id}/proyectos`}>
                      Ver todos
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                )}
              </div>

              {isLoadingPreview && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: PREVIEW_SIZE }).map((_, i) => (
                    <div
                      key={i}
                      className="h-64 rounded-xl bg-muted animate-pulse"
                    />
                  ))}
                </div>
              )}

              {!isLoadingPreview && previewTotal === 0 && (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Este laboratorio no tiene proyectos activos por el momento.
                </p>
              )}

              {!isLoadingPreview && previewTotal > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {previewProjects.map((project) => (
                    <ProjectCardExplore key={project.id} project={project} />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
