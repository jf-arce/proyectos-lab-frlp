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
  cupos: number;
  duracion?: string;
  fechaCierre?: string;
  createdAt: string;
  updatedAt?: string;
  postulaciones?: Postulacion[];
  skills?: { id: string; nombre: string; categoria?: string }[];
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
  },

  async createProject(data: Partial<Proyecto> & { skillIds?: string[] }, token: string): Promise<Proyecto> {
    if (!token) {
      console.error('CreateProject: Intento de creación sin token');
      throw new Error('No hay sesión activa');
    }

    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('CreateProject Error Response:', errorData);
      throw new Error(errorData.message || 'Error al crear el proyecto');
    }

    return res.json();
  },

  async updateProjectStatus(id: string, estado: string, token: string): Promise<Proyecto> {
    const res = await fetch(`${API_URL}/projects/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ estado }),
    });

    if (!res.ok) {
      throw new Error('Error al cambiar el estado del proyecto');
    }

    return res.json();
  },

  async updateProject(id: string, data: Partial<Proyecto> & { skillIds?: string[] }, token: string): Promise<Proyecto> {
    const res = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error('Error al actualizar el proyecto');
    }

    return res.json();
  },

  async getProjectApplications(projectId: string, token: string): Promise<Postulacion[]> {
    const res = await fetch(`${API_URL}/projects/${projectId}/applications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Error al cargar postulaciones');
    }

    return res.json();
  },

  async updateApplicationStatus(applicationId: string, estado: string, token: string): Promise<Postulacion> {
    const res = await fetch(`${API_URL}/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ estado }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar el estado de la postulación');
    }

    return res.json();
  }
};
