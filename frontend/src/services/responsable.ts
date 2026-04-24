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
};
