import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ProjectCardRecommended,
  type RecommendedProject,
} from './project-card-recommended';

const recommendedProjects: RecommendedProject[] = [
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
  },
];

export function RecommendedProjectsSection() {
  return (
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
        {recommendedProjects.slice(0, 2).map((project) => (
          <ProjectCardRecommended key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
