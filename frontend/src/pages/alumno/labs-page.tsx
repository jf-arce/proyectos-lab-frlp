import { useEffect, useState } from 'react';
import { laboratoriosService } from '@/services/laboratorios';
import type { Laboratorio } from '@/types/laboratorios';
import { LabCard } from './components/lab-card';

export function LaboratoriosPage() {
  const [labs, setLabs] = useState<Laboratorio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    laboratoriosService
      .findAll()
      .then((data) => {
        setLabs(data);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : 'Error al cargar laboratorios',
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-10">
      <header className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
          Explorá los laboratorios
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight">
          Descubrí dónde querés investigar
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Cada laboratorio de la facultad publica sus propios proyectos. Elegí
          uno para conocerlo y ver en qué podés participar.
        </p>
      </header>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <p className="text-sm text-destructive text-center py-12">{error}</p>
      )}

      {!isLoading && !error && labs.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">
          No hay laboratorios disponibles por el momento.
        </p>
      )}

      {!isLoading && !error && labs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {labs.map((lab) => (
            <LabCard key={lab.id} lab={lab} />
          ))}
        </div>
      )}
    </div>
  );
}
