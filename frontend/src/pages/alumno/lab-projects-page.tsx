import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useProjectFilters } from '@/hooks/use-project-filters';
import { laboratoriosService } from '@/services/laboratorios';
import { projectsService } from '@/services/projects';
import { skillsService } from '@/services/skills';
import type { Laboratorio } from '@/types/laboratorios';
import type { ExploreProject } from '@/types/projects';
import { LabProjectsFiltersBar } from './components/lab-projects-filters-bar';
import { ProjectCardExplore } from './components/project-card-explore';

const PAGE_SIZE = 6;

export function LabProyectosPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const [lab, setLab] = useState<Laboratorio | null>(null);
  const [labError, setLabError] = useState<string | null>(null);

  const [projects, setProjects] = useState<ExploreProject[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [skillOptions, setSkillOptions] = useState<string[]>([]);

  const {
    searchQuery,
    selectedSkills,
    debouncedQuery,
    handleSearchChange,
    setSkills,
  } = useProjectFilters(() => setIsLoading(true));

  // Cargar el laboratorio
  useEffect(() => {
    if (!id) return;
    laboratoriosService
      .findOne(id)
      .then((data) => {
        setLab(data);
        setLabError(null);
      })
      .catch((err: unknown) => {
        setLabError(
          err instanceof Error ? err.message : 'Error al cargar el laboratorio',
        );
        setIsLoading(false);
      });
  }, [id]);

  // Cargar las opciones de habilidades para el filtro.
  useEffect(() => {
    if (!token) return;
    skillsService
      .findAll(token)
      .then((skills) =>
        setSkillOptions(
          skills.map((s) => s.nombre).sort((a, b) => a.localeCompare(b)),
        ),
      )
      .catch(() => setSkillOptions([]));
  }, [token]);

  // Cargar / recargar proyectos al cambiar el lab o los filtros — reemplaza resultados.
  useEffect(() => {
    if (!token || !lab) return;

    projectsService
      .findAll(token, {
        q: debouncedQuery,
        lab: lab.nombre,
        skills: selectedSkills,
        limit: PAGE_SIZE,
        offset: 0,
      })
      .then(({ data, total }) => {
        setProjects(data);
        setTotal(total);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : 'Error al cargar proyectos',
        );
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, lab, debouncedQuery, selectedSkills.join(',')]);

  function handleLoadMore() {
    if (!token || !lab) return;
    setIsLoadingMore(true);
    projectsService
      .findAll(token, {
        q: debouncedQuery,
        lab: lab.nombre,
        skills: selectedSkills,
        limit: PAGE_SIZE,
        offset: projects.length,
      })
      .then(({ data, total }) => {
        setProjects((prev) => [...prev, ...data]);
        setTotal(total);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : 'Error al cargar proyectos',
        );
      })
      .finally(() => setIsLoadingMore(false));
  }

  const hasMore = projects.length < total;

  if (labError) {
    return (
      <div className="flex flex-col gap-8">
        <Link
          to="/alumno/laboratorios"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-4" />
          Laboratorios
        </Link>
        <p className="text-sm text-destructive text-center py-12">{labError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          to={id ? `/alumno/laboratorios/${id}` : '/alumno/laboratorios'}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-4" />
          {lab ? lab.nombre : 'Volver'}
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
            Proyectos disponibles
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {lab ? `Proyectos de ${lab.nombre}` : 'Proyectos'}
          </h1>
        </div>
      </div>

      <LabProjectsFiltersBar
        searchQuery={searchQuery}
        selectedSkills={selectedSkills}
        skillOptions={skillOptions}
        onSearchChange={handleSearchChange}
        onSkillsChange={setSkills}
      />

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <p className="text-sm text-destructive text-center py-8">{error}</p>
      )}

      {!isLoading && !error && projects.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">
          {searchQuery || selectedSkills.length > 0
            ? 'Ningún proyecto coincide con los filtros aplicados.'
            : 'Este laboratorio no tiene proyectos activos por el momento.'}
        </p>
      )}

      {!isLoading && !error && projects.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCardExplore key={project.id} project={project} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-2">
              <Button
                variant="ghost"
                size="lg"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? 'Cargando...' : 'Mostrar más proyectos'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
