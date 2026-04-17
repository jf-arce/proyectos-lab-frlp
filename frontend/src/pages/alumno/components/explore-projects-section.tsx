import { ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkillTag } from '@/components/ui/skill-tag';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ProjectCardExplore,
  type ExploreProject,
} from './project-card-explore';

const exploreProjects: ExploreProject[] = [
  {
    id: 101,
    titulo: 'Sensores de Fibra Óptica en Estructuras Civiles',
    descripcion:
      'Monitoreo estructural en tiempo real usando redes de sensores distribuidos de baja potencia.',
    laboratorio: { nombre: 'Laboratorio de Ensayos (LABEN)' },
    skills: [{ nombre: 'MATLAB' }, { nombre: 'IoT' }],
    estado: 'ACTIVO',
    created_at: new Date(Date.now()).toISOString(),
  },
  {
    id: 102,
    titulo: 'Análisis de Estabilidad en Taludes Críticos',
    descripcion:
      'Modelado geotécnico con métodos numéricos para evaluar riesgo de falla en taludes naturales.',
    laboratorio: { nombre: 'Grupo de Geotecnia' },
    skills: [{ nombre: 'Python' }, { nombre: 'Geodesia' }],
    estado: 'ACTIVO',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 103,
    titulo: 'Control Automático de Brazo Robótico Quirúrgico',
    descripcion:
      'Diseño de controladores PID y fuzzy para manipuladores con restricciones de seguridad crítica.',
    laboratorio: { nombre: 'Centro de Bioingeniería' },
    skills: [{ nombre: 'C++' }, { nombre: 'ROS' }, { nombre: 'OpenCV' }],
    estado: 'ACTIVO',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

export function ExploreProjectsSection() {
  return (
    <section>
      <div className="rounded-2xl p-6 bg-card/60 border border-input">
        <h2 className="font-display text-xl font-bold text-foreground mb-4">
          Explorar Proyectos
        </h2>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="flex-1 max-w-xl">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Buscar por palabras clave
              </label>
              <InputGroup>
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput placeholder="IA, Python, Electrónica..." />
              </InputGroup>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="min-w-45 space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Laboratorio
              </label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos los labs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Todos los labs</SelectItem>
                    <SelectItem value="lidic">LIDIC</SelectItem>
                    <SelectItem value="gese">GESE</SelectItem>
                    <SelectItem value="cit">CIT</SelectItem>
                    <SelectItem value="laben">LABEN</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Habilidades
              </label>
              <div className="flex flex-wrap gap-1.5 items-center bg-muted rounded-lg px-3 py-2 min-h-10 min-w-50">
                <SkillTag removable>Python</SkillTag>
                <SkillTag removable>C++</SkillTag>
                <span className="text-muted-foreground text-xs cursor-pointer hover:text-foreground transition-colors">
                  + Añadir
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {exploreProjects.map((project) => (
            <ProjectCardExplore key={project.id} project={project} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button variant="ghost" className="gap-2 h-10 px-4 font-semibold">
            Cargar más proyectos
            <ChevronRight />
          </Button>
        </div>
      </div>
    </section>
  );
}
