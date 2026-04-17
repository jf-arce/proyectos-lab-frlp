// Sección hero con perfil del usuario, stats, carrusel de proyectos recomendados por match de skills y sección explorar con filtros

import {
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  FileText,
} from 'lucide-react';
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
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';

// ── Helper ─────────────────────────────────────────────────
function formatRelativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'Publicado hoy';
  if (days === 1) return 'Publicado ayer';
  return `Publicado hace ${days} días`;
}

// ── Datos de muestra ──────────────────────────────────────
const recommendedProjects = [
  {
    id: 1,
    titulo: 'Optimización de Redes Neuronales',
    descripcion:
      'Investigación sobre la reducción de latencia en modelos transformadores para dispositivos embebidos.',
    laboratorio: { nombre: 'LIDIC - Sistemas de Cómputo' },
    skills: [
      { nombre: 'Python', categoria: 'Lenguaje' },
      { nombre: 'PyTorch', categoria: 'Framework' },
      { nombre: 'CUDA', categoria: 'Hardware' },
    ],
    match: 92,
    estado: 'ACTIVO' as const,
  },
  {
    id: 2,
    titulo: 'Micro-redes Eléctricas Inteligentes',
    descripcion:
      'Simulación de balance de carga en entornos industriales utilizando energías renovables mixtas.',
    laboratorio: { nombre: 'GESE - Grupo de Energía' },
    skills: [
      { nombre: 'MATLAB', categoria: 'Herramienta' },
      { nombre: 'Simulink', categoria: 'Herramienta' },
    ],
    match: 85,
    estado: 'ACTIVO' as const,
  },
  {
    id: 3,
    titulo: 'Plataforma Interoperable de Salud',
    descripcion:
      'Desarrollo de APIs seguras bajo estándar HL7 FHIR para integración de historias clínicas.',
    laboratorio: { nombre: 'LIS - Lab de Ing. de Software' },
    skills: [
      { nombre: 'Java', categoria: 'Lenguaje' },
      { nombre: 'FHIR', categoria: 'Estándar' },
      { nombre: 'PostgreSQL', categoria: 'Base de datos' },
    ],
    match: 78,
    estado: 'ACTIVO' as const,
  },
];

const exploreProjects = [
  {
    id: 101,
    titulo: 'Sensores de Fibra Óptica en Estructuras Civiles',
    descripcion:
      'Monitoreo estructural en tiempo real usando redes de sensores distribuidos de baja potencia.',
    laboratorio: { nombre: 'Laboratorio de Ensayos (LABEN)' },
    skills: [{ nombre: 'MATLAB' }, { nombre: 'IoT' }],
    estado: 'ACTIVO' as const,
    created_at: new Date(Date.now()).toISOString(),
  },
  {
    id: 102,
    titulo: 'Análisis de Estabilidad en Taludes Críticos',
    descripcion:
      'Modelado geotécnico con métodos numéricos para evaluar riesgo de falla en taludes naturales.',
    laboratorio: { nombre: 'Grupo de Geotecnia' },
    skills: [{ nombre: 'Python' }, { nombre: 'Geodesia' }],
    estado: 'ACTIVO' as const,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 103,
    titulo: 'Control Automático de Brazo Robótico Quirúrgico',
    descripcion:
      'Diseño de controladores PID y fuzzy para manipuladores con restricciones de seguridad crítica.',
    laboratorio: { nombre: 'Centro de Bioingeniería' },
    skills: [{ nombre: 'C++' }, { nombre: 'ROS' }, { nombre: 'OpenCV' }],
    estado: 'ACTIVO' as const,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

// ── Componente principal ──────────────────────────────────
export function AlumnoDashboardPage() {
  const { user } = useAuth();
  const displayName = user ? `${user.nombre} ${user.apellido}` : 'Alumno';
  const initials = user
    ? `${user.nombre[0]}${user.apellido[0]}`.toUpperCase()
    : 'A';

  return (
    <div className="space-y-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
      <aside className="lg:sticky top-20.25 self-start mb-0">
        <Card className="overflow-hidden shadow-card p-0">
          {/* Banner decorativo */}
          <div className="relative bg-primary h-16 overflow-hidden">
            <div className="absolute -left-8 -top-8 size-28 bg-primary-foreground opacity-5 rounded-full blur-2xl pointer-events-none" />
          </div>

          <CardContent className="pt-0 pb-5 px-4">
            {/* Avatar superpuesto al banner */}
            <div className="-mt-8 mb-3">
              <Avatar className="w-16 h-16 border-4 border-card shadow-sm">
                <AvatarFallback className="bg-secondary text-primary font-bold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Datos del usuario */}
            <div className="space-y-0.5 mb-4">
              <p className="font-display font-bold text-foreground leading-tight">
                {displayName}
              </p>
              <p className="text-muted-foreground text-xs truncate">
                {user?.email}
              </p>

              <Separator className="my-2" />

              <p className="text-muted-foreground text-sm">
                Estudiante · 5to año
              </p>
              <p className="text-muted-foreground text-sm">
                Descripcion breve sobre el alumno, intereses y objetivos. Esto
                ayuda a los laboratorios a entender mejor el perfil del
                estudiante y recomendar proyectos más relevantes.
              </p>
            </div>

            {/* Separador */}
            <div className="border-t border-border my-4" />

            {/* Navegación rápida */}
            <nav className="space-y-0.5">
              <Button
                asChild
                variant="ghost"
                className="w-full justify-start gap-2.5 font-medium h-9"
              >
                <Link to="/alumno/perfil">
                  <User className="size-4 shrink-0" />
                  Mi Perfil
                </Link>
              </Button>

              <div className="w-full justify-start items-center gap-2.5 font-medium h-9 flex px-3">
                <FileText className="size-4 shrink-0" />
                <p className="text-foreground text-sm leading-tight">
                  Postulaciones activas:
                </p>
                <p className="text-primary font-bold text-sm leading-none">0</p>
              </div>
            </nav>
          </CardContent>
        </Card>
      </aside>

      {/* ── Proyectos Recomendados ────────────────────────── */}
      <div className="space-y-5">
        <section className="rounded-2xl p-6 bg-card/60 border border-input">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Proyectos Recomendados
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                Basado en tu perfil y habilidades cargadas.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft />
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {recommendedProjects.slice(0, 2).map((project) => {
              const extraSkills = project.skills.length - 3;
              return (
                <Card
                  key={project.id}
                  className="px-1 py-5 flex flex-col shadow-card hover:shadow-card-hover transition-shadow duration-200"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <StatusBadge
                        status={
                          project.estado === 'ACTIVO' ? 'active' : 'closed'
                        }
                      />
                      <Badge
                        variant="outline"
                        className="font-semibold text-primary border-primary/30 shrink-0"
                      >
                        {project.match}% Match
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
                    {/* Lab strip */}
                    <div className="mx-0 mb-3 flex items-center gap-2 rounded-md bg-muted px-3 py-2">
                      <FlaskConical className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-medium text-foreground truncate">
                        {project.laboratorio.nombre}
                      </span>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
                      {project.skills.slice(0, 3).map((skill) => (
                        <SkillTag key={skill.nombre}>{skill.nombre}</SkillTag>
                      ))}
                      {extraSkills > 0 && (
                        <span className="text-xs text-muted-foreground self-center">
                          +{extraSkills} más
                        </span>
                      )}
                    </div>
                  </CardContent>

                  {/* CTA — fuera de CardFooter para evitar su border-t */}
                  <div className="px-4">
                    <Button variant="default" className="h-10 w-full">
                      Ver detalles
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ── Explorar Proyectos ───────────────────────────── */}
        <section>
          <div className="rounded-2xl p-6 bg-card/60 border border-input">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">
              Explorar Proyectos
            </h2>
            {/* Filtros */}
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

            {/* Grid de proyectos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {exploreProjects.map((project) => (
                <Card
                  key={project.id}
                  className="p-0 flex flex-col shadow-card hover:shadow-card-hover transition-shadow duration-200"
                >
                  <CardContent className="p-5 flex flex-col flex-1 gap-3">
                    {/* Meta superior */}
                    <div className="flex items-center justify-between">
                      <StatusBadge
                        status={
                          project.estado === 'ACTIVO' ? 'active' : 'closed'
                        }
                      />
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeDate(project.created_at)}
                      </span>
                    </div>

                    {/* Título y descripción */}
                    <div>
                      <h4 className="font-display font-bold text-foreground text-base leading-snug mb-1.5">
                        {project.titulo}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {project.descripcion}
                      </p>
                    </div>

                    {/* Lab strip */}
                    <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
                      <FlaskConical className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-medium text-foreground truncate">
                        {project.laboratorio.nombre}
                      </span>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {project.skills.map((skill) => (
                        <SkillTag key={skill.nombre}>{skill.nombre}</SkillTag>
                      ))}
                    </div>

                    {/* CTA */}
                    <Button variant="default" className="h-10 w-full mt-auto">
                      Ver detalles
                    </Button>
                  </CardContent>
                </Card>
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
      </div>
    </div>
  );
}
