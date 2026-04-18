import { API_URL } from '@/lib/api';
import type { ProjectFilters, ProjectsPage } from '@/types/projects';

async function request<T>(path: string, token: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
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

export const projectsService = {
  findAll(token: string, filters: ProjectFilters = {}): Promise<ProjectsPage> {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.lab && filters.lab !== 'all') params.set('lab', filters.lab);
    filters.skills?.forEach((s) => params.append('skills', s));
    if (filters.limit !== undefined) params.set('limit', String(filters.limit));
    if (filters.offset !== undefined)
      params.set('offset', String(filters.offset));
    const qs = params.toString();
    return request<ProjectsPage>(`/projects${qs ? `?${qs}` : ''}`, token);
  },
};
