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
