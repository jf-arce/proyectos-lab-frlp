import { ArrowRight, CalendarDays, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface ProjectActionCardProps {
  cupos: number;
  createdAt: string;
  isClosed: boolean;
  hasApplied: boolean;
  isApplying: boolean;
  fechaCierre: string | null;
  onApply: () => void;
}

export function ProjectActionCard({
  cupos,
  createdAt,
  isClosed,
  hasApplied,
  isApplying,
  fechaCierre,
  onApply,
}: ProjectActionCardProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-5">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Cupos disponibles
          </span>
          <p className="text-3xl font-black text-foreground">{cupos}</p>
        </div>

        <div className="border-t border-border" />

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-4" />
            <span>Publicado</span>
          </div>
          <span className="font-semibold">{formatDate(createdAt)}</span>
        </div>

        <div className="space-y-2 pt-1">
          {isClosed ? (
            <Button disabled variant="outline" className="w-full h-12">
              Proyecto cerrado
            </Button>
          ) : hasApplied ? (
            <Button disabled variant="secondary" className="h-12 w-full gap-2">
              <CheckCircle2 className="size-4" />
              Ya postulado
            </Button>
          ) : (
            <Button
              className="w-full h-12 group"
              onClick={onApply}
              disabled={isApplying}
            >
              {isApplying ? (
                'Enviando...'
              ) : (
                <div className="flex justify-center items-center gap-2">
                  Postularse ahora{' '}
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          )}

          {fechaCierre && (
            <p className="text-center mt-4 text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
              Cierre de inscripciones: {formatDate(fechaCierre)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
