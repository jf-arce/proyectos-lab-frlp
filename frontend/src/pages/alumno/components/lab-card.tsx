import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import type { Laboratorio } from '@/types/laboratorios';
import { LabMonogram } from './lab-monogram';

export function LabCard({ lab }: { lab: Laboratorio }) {
  return (
    <Card>
      <CardContent>
        <Link
          to={`/alumno/laboratorios/${lab.id}`}
          className="group flex flex-col gap-4"
        >
          <div className="flex items-start justify-between gap-4">
            <LabMonogram nombre={lab.nombre} size="lg" />
            <ArrowRight className="size-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-display text-xl font-bold text-foreground leading-snug">
              {lab.nombre}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {lab.descripcion}
            </p>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
