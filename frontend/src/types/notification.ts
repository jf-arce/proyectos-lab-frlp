export type NotificationType = 'NUEVA_POSTULACION' | 'ESTADO_ACTUALIZADO';

export interface Notification {
  id: string;
  usuario: {
    id: string;
  };
  postulacion: {
    id: string;
    proyecto: {
      id: string;
      titulo: string;
    };
    alumno: {
      id: string;
      nombre: string;
      apellido: string;
    };
  } | null;
  tipo: NotificationType;
  mensaje: string;
  leida: boolean;
  emailEnviado: boolean;
  createdAt: string;
}
