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
  isProfileComplete: boolean;
}

export interface UpdateAlumnoDto {
  nombre?: string;
  apellido?: string;
  legajo?: string;
  anioEnCurso?: number;
  bio?: string | null;
  cvUrl?: string | null;
}

export interface AddSkillDto {
  skillId?: string;
  nombre?: string;
  categoria?: string;
}

export const alumnoService = {
  async getById(id: string, token: string): Promise<AlumnoProfile> {
    const res = await fetch(`${API_URL}/profile/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al cargar el perfil del alumno');
    return res.json();
  },

  async getMyProfile(token: string): Promise<AlumnoProfile> {
    const res = await fetch(`${API_URL}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al cargar tu perfil');
    return res.json();
  },

  async updateMyProfile(dto: UpdateAlumnoDto, token: string): Promise<AlumnoProfile> {
    const res = await fetch(`${API_URL}/profile/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Error al actualizar el perfil' }));
      throw new Error(error.message ?? 'Error al actualizar el perfil');
    }
    return res.json();
  },

  async addSkill(dto: AddSkillDto, token: string): Promise<AlumnoProfile> {
    const res = await fetch(`${API_URL}/profile/me/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Error al agregar la habilidad');
    return res.json();
  },

  async removeSkill(skillId: string, token: string): Promise<void> {
    const res = await fetch(`${API_URL}/profile/me/skills/${skillId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al eliminar la habilidad');
  },
};
