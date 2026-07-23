import { FlaskConical } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkillTag } from '@/components/ui/skill-tag';
import { StatusBadge, ESTADO_TO_STATUS } from '@/components/ui/status-badge';
import type { MyApplication } from '@/types/projects';

function formatRelativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'Postulado hoy';
  if (days === 1) return 'Postulado ayer';
  return `Postulado hace ${days} días`;
}

export function PostulacionCard({
  application,
}: {
  application: MyApplication;
}) {
  const { proyecto } = application;

  return (
    <Card className="p-0 flex flex-col shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <CardContent className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <FlaskConical className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-medium text-muted-foreground truncate">
              {proyecto.laboratorio.nombre}
            </span>
          </div>
          <StatusBadge status={ESTADO_TO_STATUS[application.estado]} />
        </div>

        <div>
          <h4 className="font-display font-bold text-foreground text-base leading-snug mb-1.5">
            {proyecto.titulo}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {proyecto.descripcion}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 flex-1">
          {proyecto.skills.map((skill) => (
            <SkillTag key={skill.id}>{skill.nombre}</SkillTag>
          ))}
        </div>

        <span className="text-xs text-muted-foreground">
          {formatRelativeDate(application.createdAt)}
        </span>

        <Button variant="default" className="h-10 w-full mt-auto" asChild>
          <Link to={`/alumno/postulaciones/${application.id}`}>
            Ver detalle
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
