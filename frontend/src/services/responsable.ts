import { API_URL } from '@/lib/api';

export interface ResponsableProfile {
  id: string;
  nombre: string;
  apellido: string;
  laboratorio: {
    id: string;
    nombre: string;
  };
}

export const responsableService = {
  async getProfile(token: string): Promise<ResponsableProfile> {
    const res = await fetch(`${API_URL}/responsable-laboratorio/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Error al cargar el perfil del responsable');
    }

    return res.json();
  },

  async updateProfile(data: { nombre?: string; apellido?: string; email?: string; password?: string }, token: string): Promise<ResponsableProfile> {
    const res = await fetch(`${API_URL}/responsable-laboratorio/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error('Error al actualizar el perfil');
    }

    return res.json();
  },
};
