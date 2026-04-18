import { API_URL } from '@/lib/api';

export interface Postulacion {
  id: string;
  estado: string;
  alumno: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export interface Proyecto {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  createdAt: string;
  postulaciones?: Postulacion[];
}

export const proyectosService = {
  async getMyProjects(token: string): Promise<Proyecto[]> {
    const res = await fetch(`${API_URL}/projects/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!res.ok) {
      throw new Error('Error al cargar proyectos');
    }
    
    return res.json();
  }
};
