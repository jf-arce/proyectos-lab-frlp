import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { usePerfilContext } from '@/context/perfil-context';
import { projectsService } from '@/services/projects';
import type { RecommendedProject } from '@/types/projects';
import { ProjectCardRecommended } from './project-card-recommended';

const PAGE_SIZE = 2;

export function RecommendedProjectsSection() {
  const { token } = useAuth();
  const { profile } = usePerfilContext();

  const [recommendations, setRecommendations] = useState<RecommendedProject[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    projectsService
      .getRecommended(token)
      .then((data) => {
        setRecommendations(data);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Error al cargar proyectos recomendados',
        );
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const hasSkills = (profile?.skills.length ?? 0) > 0;
  const totalPages = Math.ceil(recommendations.length / PAGE_SIZE);
  const visibleProjects = recommendations.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <section className="rounded-2xl p-6 bg-card/60 border border-input">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Proyectos Recomendados
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Basado en tu perfil y habilidades cargadas.
          </p>
        </div>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Anteriores"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Siguientes"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <p className="text-sm text-destructive text-center py-8">{error}</p>
      )}

      {!isLoading && !error && !hasSkills && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Todavía no cargaste habilidades en tu perfil.{' '}
          <Link to="/alumno/perfil" className="text-primary font-semibold underline">
            Completá tu perfil
          </Link>{' '}
          para recibir recomendaciones personalizadas.
        </p>
      )}

      {!isLoading && !error && hasSkills && recommendations.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No encontramos proyectos activos que coincidan con tus habilidades
          por el momento.
        </p>
      )}

      {!isLoading && !error && visibleProjects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {visibleProjects.map(({ project, score }) => (
            <ProjectCardRecommended
              key={project.id}
              project={project}
              score={score}
            />
          ))}
        </div>
      )}
    </section>
  );
}
