import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { projectsService } from '@/services/projects';
import type { MyApplication } from '@/types/projects';
import { Button } from '@/components/ui/button';
import { PostulacionCard } from './components/postulacion-card';
import { PostulacionesFiltersBar } from './components/postulaciones-filters-bar';

export function PostulacionesPage() {
  const { token } = useAuth();

  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('all');

  useEffect(() => {
    if (!token) return;

    projectsService
      .getMyApplications(token)
      .then((apps) => {
        setApplications(apps);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Error al cargar tus postulaciones',
        );
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  // El backend ya devuelve ordenado por fecha desc; acá solo se filtra
  const query = searchQuery.trim().toLowerCase();
  const filtered = applications.filter((app) => {
    if (selectedEstado !== 'all' && app.estado !== selectedEstado) return false;
    if (!query) return true;
    return (
      app.proyecto.titulo.toLowerCase().includes(query) ||
      app.proyecto.laboratorio.nombre.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          Mis Postulaciones
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Seguí el estado de cada una de tus postulaciones a proyectos de
          laboratorio.
        </p>
      </div>

      <PostulacionesFiltersBar
        searchQuery={searchQuery}
        selectedEstado={selectedEstado}
        onSearchChange={setSearchQuery}
        onEstadoChange={setSelectedEstado}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-destructive text-center py-8">{error}</p>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Todavía no te postulaste a ningún proyecto.
          </p>
          <Button asChild>
            <Link to="/alumno/dashboard">Explorar proyectos</Link>
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No se encontraron postulaciones con los filtros aplicados.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filtered.length}{' '}
            {filtered.length === 1 ? 'postulación' : 'postulaciones'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((app) => (
              <PostulacionCard key={app.id} application={app} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
