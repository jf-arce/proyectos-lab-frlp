export const POSTULACION_CREADA = 'postulacion.creada' as const;

export class PostulacionCreadaEvent {
  postulacionId!: string;
}
