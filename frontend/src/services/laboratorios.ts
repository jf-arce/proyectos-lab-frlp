import { API_URL } from '@/lib/api';
import type { Laboratorio } from '@/types/laboratorios';

// GET /laboratorios y GET /laboratorios/:id son endpoints públicos: no requieren token.
async function request<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('El servidor no responde. Verificá tu conexión.');
    }
    throw new Error('No se pudo conectar con el servidor.');
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message ?? 'Error en la solicitud');
  }

  return res.json() as Promise<T>;
}

export const laboratoriosService = {
  findAll(): Promise<Laboratorio[]> {
    return request<Laboratorio[]>('/laboratorios');
  },

  findOne(id: string): Promise<Laboratorio> {
    return request<Laboratorio>(`/laboratorios/${id}`);
  },
};
