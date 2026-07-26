import { FlaskConical } from 'lucide-react';
import { Link } from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkillTag } from '@/components/ui/skill-tag';
import type { RecommendedProjectData } from '@/types/projects';

export function ProjectCardRecommended({
  project,
  score,
}: {
  project: RecommendedProjectData;
  score: number;
}) {
  const extraSkills = project.skills.length - 3;
  const matchPercent = Math.round(score * 100);

  return (
    <Card className="px-1 py-5 flex flex-col shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge
            variant="outline"
            className="font-semibold text-primary border-primary/30 shrink-0"
          >
            {matchPercent}% Match
          </Badge>
        </div>
        <CardTitle className="font-display text-base font-semibold leading-snug">
          {project.titulo}
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed line-clamp-2">
          {project.descripcion}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 pt-0 pb-0">
        <div className="mx-0 mb-3 flex items-center gap-2 rounded-md bg-muted px-3 py-2">
          <FlaskConical className="size-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-foreground truncate">
            {project.laboratorio.nombre}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
          {project.skills.slice(0, 3).map((skill) => (
            <SkillTag key={skill.id}>{skill.nombre}</SkillTag>
          ))}
          {extraSkills > 0 && (
            <span className="text-xs text-muted-foreground self-center">
              +{extraSkills} más
            </span>
          )}
        </div>
      </CardContent>

      <div className="px-4">
        <Button variant="default" className="h-10 w-full" asChild>
          <Link to={`/alumno/proyecto/${project.id}`}>Ver detalles</Link>
        </Button>
      </div>
    </Card>
  );
}
