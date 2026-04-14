import { API_URL } from '@/lib/api';
import type { AuthResponse, RegisterDto } from '@/types/auth';

async function request<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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

export const authService = {
  login(email: string, password: string) {
    return request<AuthResponse>('/auth/login', { email, password });
  },

  register(dto: RegisterDto) {
    return request<AuthResponse>('/auth/register', dto);
  },

  refreshTokens(refreshToken: string) {
    return request<Pick<AuthResponse, 'accessToken'>>('/auth/refresh', {
      refreshToken,
    });
  },

  logout(refreshToken: string) {
    return request<void>('/auth/logout', { refreshToken });
  },
};
