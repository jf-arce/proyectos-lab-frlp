export const Role = {
  ALUMNO: 'ALUMNO',
  RESPONSABLE_LABORATORIO: 'RESPONSABLE_LABORATORIO',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

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
