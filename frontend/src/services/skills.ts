import { API_URL } from '@/lib/api';

export interface Skill {
  id: string;
  nombre: string;
  categoria?: string;
  esPredefinida: boolean;
}

export const skillsService = {
  async findAll(token: string): Promise<Skill[]> {
    const res = await fetch(`${API_URL}/skills`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Error al cargar habilidades');
    }

    return res.json();
  },

  async createSkill(data: { nombre: string; categoria?: string }, token: string): Promise<Skill> {
    const res = await fetch(`${API_URL}/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error('Error al crear la habilidad');
    }

    return res.json();
  },
};
