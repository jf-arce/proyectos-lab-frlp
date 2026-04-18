import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useProjectFilters } from '@/hooks/use-project-filters';
import { projectsService } from '@/services/projects';
import type { ExploreProject } from '@/types/projects';
import { ProjectCardExplore } from './project-card-explore';
import { ProjectFiltersBar } from './project-filters-bar';

const PAGE_SIZE = 4;

export function ExploreProjectsSection() {
  const { token } = useAuth();

  const [projects, setProjects] = useState<ExploreProject[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(!!token);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [labOptions, setLabOptions] = useState<string[]>([]);
  const [skillOptions, setSkillOptions] = useState<string[]>([]);
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  const {
    searchQuery,
    selectedLab,
    selectedSkills,
    debouncedQuery,
    handleSearchChange,
    handleLabChange,
    setSkills,
  } = useProjectFilters(() => setIsLoading(true));

  // Carga inicial y al cambiar filtros — reemplaza resultados
  useEffect(() => {
    if (!token) return;

    projectsService
      .findAll(token, {
        q: debouncedQuery,
        lab: selectedLab,
        skills: selectedSkills,
        limit: PAGE_SIZE,
        offset: 0,
      })
      .then(({ data, total }) => {
        setProjects(data);
        setTotal(total);
        setError(null);
        if (!optionsLoaded) {
          setLabOptions(
            Array.from(new Set(data.map((p) => p.laboratorio.nombre))).sort(),
          );
          setSkillOptions(
            Array.from(
              new Set(data.flatMap((p) => p.skills.map((s) => s.nombre))),
            ).sort(),
          );
          setOptionsLoaded(true);
        }
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : 'Error al cargar proyectos',
        );
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, debouncedQuery, selectedLab, selectedSkills.join(',')]);

  function handleLoadMore() {
    if (!token) return;
    setIsLoadingMore(true);
    projectsService
      .findAll(token, {
        q: debouncedQuery,
        lab: selectedLab,
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

  return (
    <section>
      <div className="rounded-2xl p-6 bg-card/60 border border-input">
        <h2 className="font-display text-xl font-bold text-foreground mb-4">
          Explorar Proyectos
        </h2>

        <ProjectFiltersBar
          searchQuery={searchQuery}
          selectedLab={selectedLab}
          selectedSkills={selectedSkills}
          labOptions={labOptions}
          skillOptions={skillOptions}
          onSearchChange={handleSearchChange}
          onLabChange={handleLabChange}
          onSkillsChange={setSkills}
        />

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

        {!isLoading && !error && projects.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {!optionsLoaded
              ? 'No hay proyectos activos por el momento.'
              : 'Ningún proyecto coincide con los filtros aplicados.'}
          </p>
        )}

        {!isLoading && !error && projects.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((project) => (
                <ProjectCardExplore key={project.id} project={project} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="ghost"
                  className="px-4 h-10"
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
    </section>
  );
}
