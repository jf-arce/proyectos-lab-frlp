import { FlaskConical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkillTag } from '@/components/ui/skill-tag';
import type { ExploreProject } from '@/types/projects';
import { Link } from 'react-router';

const NOW = Date.now();

function formatRelativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'Publicado hoy';
  if (days === 1) return 'Publicado ayer';
  return `Publicado hace ${days} días`;
}

export function ProjectCardExplore({ project }: { project: ExploreProject }) {
  const isToday =
    Math.floor((NOW - new Date(project.createdAt).getTime()) / 86400000) <= 0;

  return (
    <Card className="p-0 flex flex-col shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <CardContent className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <FlaskConical className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-medium text-muted-foreground truncate">
              {project.laboratorio.nombre}
            </span>
          </div>
          {isToday ? (
            <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full shrink-0">
              Publicado hoy
            </span>
          ) : (
            <span className="text-xs text-muted-foreground shrink-0">
              {formatRelativeDate(project.createdAt)}
            </span>
          )}
        </div>

        <div>
          <h4 className="font-display font-bold text-foreground text-base leading-snug mb-1.5">
            {project.titulo}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {project.descripcion}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 flex-1">
          {project.skills.map((skill) => (
            <SkillTag key={skill.nombre}>{skill.nombre}</SkillTag>
          ))}
        </div>

        <Button variant="default" className="h-10 w-full mt-auto" asChild>
          <Link to={`/alumno/proyecto/${project.id}`}>Ver detalles</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
