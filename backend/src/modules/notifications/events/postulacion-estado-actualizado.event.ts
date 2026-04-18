import { PostulacionEstado } from '@/modules/postulaciones/enums/postulacion-estado.enum';

export const POSTULACION_ESTADO_ACTUALIZADO =
  'postulacion.estado.actualizado' as const;

export class PostulacionEstadoActualizadoEvent {
  postulacionId!: string;
  nuevoEstado!: PostulacionEstado;
}
