import { FlaskConical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkillTag } from '@/components/ui/skill-tag';
import { StatusBadge } from '@/components/ui/status-badge';

export interface ExploreProject {
  id: number;
  titulo: string;
  descripcion: string;
  laboratorio: { nombre: string };
  skills: { nombre: string }[];
  estado: 'ACTIVO' | 'CERRADO';
  created_at: string;
}

function formatRelativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'Publicado hoy';
  if (days === 1) return 'Publicado ayer';
  return `Publicado hace ${days} días`;
}

export function ProjectCardExplore({ project }: { project: ExploreProject }) {
  return (
    <Card className="p-0 flex flex-col shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <CardContent className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between">
          <StatusBadge
            status={project.estado === 'ACTIVO' ? 'active' : 'closed'}
          />
          <span className="text-xs text-muted-foreground">
            {formatRelativeDate(project.created_at)}
          </span>
        </div>

        <div>
          <h4 className="font-display font-bold text-foreground text-base leading-snug mb-1.5">
            {project.titulo}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {project.descripcion}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
          <FlaskConical className="size-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-foreground truncate">
            {project.laboratorio.nombre}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 flex-1">
          {project.skills.map((skill) => (
            <SkillTag key={skill.nombre}>{skill.nombre}</SkillTag>
          ))}
        </div>

        <Button variant="default" className="h-10 w-full mt-auto">
          Ver detalles
        </Button>
      </CardContent>
    </Card>
  );
}
