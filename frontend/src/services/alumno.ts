import { API_URL } from '@/lib/api';

export interface AlumnoProfile {
  id: string;
  nombre: string;
  apellido: string;
  legajo: string;
  anioEnCurso: number;
  bio: string | null;
  cvUrl: string | null;
  skills: { id: string; nombre: string; categoria?: string }[];
  usuario: {
    email: string;
  };
}

export const alumnoService = {
  async getById(id: string, token: string): Promise<AlumnoProfile> {
    const res = await fetch(`${API_URL}/profile/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Error al cargar el perfil del alumno');
    }

    return res.json();
  },
};
