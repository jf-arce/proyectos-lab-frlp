export type Role = 'ALUMNO' | 'RESPONSABLE_LABORATORIO';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  rol: Role;
  nombre: string;
  apellido: string;
  legajo?: string;
  anioEnCurso?: number;
  laboratorioId?: string;
}
