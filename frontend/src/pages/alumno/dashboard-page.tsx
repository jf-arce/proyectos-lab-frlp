// Sección hero con bienvenida, carrusel de proyectos recomendados por match de skills y sección explorar con filtros

import {
  FlaskConical,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Beaker,
  Zap,
  Terminal,
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
import { Search } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────
function getDisplayName(email: string): string {
  const localPart = email.split('@')[0];
  const namePart = localPart.split('.')[0];
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
}

// ── Datos de muestra ──────────────────────────────────────
const recommendedProjects = [
  {
    id: 1,
    category: 'IA & Datos',
    match: 92,
    title: 'Optimización de Redes Neuronales',
    description:
      'Investigación sobre la reducción de latencia en modelos transformadores para dispositivos embebidos.',
    lab: 'LIDIC - Sistemas de Cómputo',
    icon: Beaker,
  },
  {
    id: 2,
    category: 'Energía',
    match: 85,
    title: 'Micro-redes Eléctricas Inteligentes',
    description:
      'Simulación de balance de carga en entornos industriales utilizando energías renovables mixtas.',
    lab: 'GESE - Grupo de Energía',
    icon: Zap,
  },
  {
    id: 3,
    category: 'Software',
    match: 78,
    title: 'Plataforma Interoperable de Salud',
    description:
      'Desarrollo de APIs seguras bajo estándar HL7 FHIR para integración de historias clínicas.',
    lab: 'LIS - Lab de Ing. de Software',
    icon: Terminal,
  },
];

const exploreProjects = [
  {
    id: 101,
    code: 'P-2024-001',
    title: 'Sensores de Fibra Óptica en Estructuras Civiles',
    postedLabel: 'Publicado hoy',
    vacancies: 2,
    lab: 'Laboratorio de Ensayos (LABEN)',
    duration: '10 hrs/semanales · 6 meses',
    skills: ['MATLAB', 'Civil', 'IoT'],
    urgent: false,
    gradient: 'from-primary to-primary/70',
  },
  {
    id: 102,
    code: 'P-2024-005',
    title: 'Análisis de Estabilidad en Taludes Críticos',
    postedLabel: 'Publicado hace 2 días',
    vacancies: 3,
    lab: 'Grupo de Geotecnia',
    duration: '12 hrs/semanales · 12 meses',
    skills: ['Python', 'Geodesia'],
    urgent: false,
    gradient: 'from-primary/80 to-primary',
  },
  {
    id: 103,
    code: 'P-2023-142',
    title: 'Control Automático de Brazo Robótico Quirúrgico',
    postedLabel: 'Cierra en 24h',
    vacancies: 1,
    lab: 'Centro de Bioingeniería',
    duration: '15 hrs/semanales · Permanente',
    skills: ['C++', 'ROS', 'OpenCV'],
    urgent: true,
    gradient: 'from-primary/60 to-primary',
  },
];

// ── Componente principal ──────────────────────────────────
export function AlumnoDashboardPage() {
  const { user } = useAuth();
  const displayName = user ? getDisplayName(user.email) : 'Alumno';

  return (
    <div className="space-y-10">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section>
        <div className="relative overflow-hidden rounded-xl bg-primary p-8 md:p-10">
          <div className="relative z-10 max-w-lg">
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-primary-foreground leading-tight mb-3">
              Bienvenido, {displayName}.
            </h1>
            <p className="text-primary-foreground/75 text-base md:text-lg mb-7 leading-relaxed">
              Explora oportunidades en nuestros laboratorios y potencia tu
              carrera académica participando en proyectos reales de
              investigación y desarrollo.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-card text-primary hover:bg-card/90 shadow-sm"
              >
                <Link to="/alumno/postulaciones">Ver mis aplicaciones</Link>
              </Button>
              <Button
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Guía del Alumno
              </Button>
            </div>
          </div>

          {/* Decoración */}
          <FlaskConical className="absolute right-6 bottom-0 size-48 text-primary-foreground opacity-10 pointer-events-none" />
          <div className="absolute -right-16 -top-16 size-64 bg-primary-foreground opacity-5 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* ── Proyectos Recomendados ────────────────────────── */}
      <section>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedProjects.map((project) => {
            const Icon = project.icon;
            return (
              <Card
                key={project.id}
                className="flex flex-col h-full shadow-card hover:shadow-card-hover transition-shadow duration-200"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="secondary">{project.category}</Badge>
                    <Badge variant="outline">{project.match}% Match</Badge>
                  </div>
                  <CardTitle className="font-display text-base font-semibold leading-snug">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 justify-end pt-0">
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        Laboratorio
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {project.lab}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Explorar Proyectos ───────────────────────────── */}
      <section>
        <div className="bg-muted/60 rounded-2xl p-6 md:p-8">
          {/* Encabezado y filtros */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div className="flex-1 max-w-xl">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Explorar Proyectos
              </h2>
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
                  <SelectTrigger>
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
                <div className="flex flex-wrap gap-1.5 items-center bg-card border border-input rounded-lg px-3 py-2 min-h-10 min-w-50">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exploreProjects.map((project) => (
              <Card
                key={project.id}
                className="overflow-hidden group cursor-pointer shadow-sm hover:shadow-card-hover transition-all duration-200"
              >
                <div className={`h-28 relative overflow-hidden bg-primary`}>
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${project.gradient}`}
                  />
                  <div className="absolute bottom-3 left-4">
                    <span className="text-primary-foreground/60 text-[10px] font-bold uppercase tracking-widest">
                      Código: {project.code}
                    </span>
                  </div>
                </div>

                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        project.urgent
                          ? 'text-xs font-medium text-destructive'
                          : 'text-xs font-medium text-primary'
                      }
                    >
                      {project.postedLabel}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {project.vacancies === 1
                        ? 'Última vacante'
                        : `Quedan ${project.vacancies} vacantes`}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {project.title}
                  </h4>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="size-4 shrink-0" />
                      <span className="text-xs">{project.lab}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="size-4 shrink-0" />
                      <span className="text-xs">{project.duration}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {project.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                  >
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cargar más */}
          <div className="mt-10 flex justify-center">
            <Button
              variant="ghost"
              className="gap-2 text-primary font-semibold"
            >
              Cargar más proyectos
              <ChevronRight />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
