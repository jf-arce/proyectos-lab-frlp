export interface ExploreProject {
  id: string;
  titulo: string;
  descripcion: string;
  laboratorio: { nombre: string };
  skills: { nombre: string }[];
  createdAt: string;
}

export interface ProjectFilters {
  q?: string;
  lab?: string;
  skills?: string[];
  limit?: number;
  offset?: number;
}

export interface ProjectsPage {
  data: ExploreProject[];
  total: number;
}

export interface ProjectLaboratorio {
  id: string;
  nombre: string;
  descripcion: string;
  emailContacto: string | null;
}

export interface ProjectSkill {
  id: string;
  nombre: string;
  categoria: string | null;
}

export interface ProjectDetail {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'ACTIVO' | 'CERRADO';
  cupos: number;
  duracion: string | null;
  fechaCierre: string | null;
  createdAt: string;
  laboratorio: ProjectLaboratorio;
  skills: ProjectSkill[];
}

export interface MyApplication {
  id: string;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  createdAt: string;
  proyecto: { id: string };
}
