import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Postulacion } from '@/modules/postulaciones/entities/postulacion.entity';
import { ResponsableLaboratorio } from '@/modules/responsable-laboratorio/entities/responsable-laboratorio.entity';
import { PostulacionEstado } from '@/modules/postulaciones/enums/postulacion-estado.enum';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { NotificationType } from './enums/notification-type.enum';
import {
  POSTULACION_CREADA,
  PostulacionCreadaEvent,
} from './events/postulacion-creada.event';
import {
  POSTULACION_ESTADO_ACTUALIZADO,
  PostulacionEstadoActualizadoEvent,
} from './events/postulacion-estado-actualizado.event';

@Injectable()
export class NotificationsListener {
  private readonly logger = new Logger(NotificationsListener.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    @InjectRepository(Postulacion)
    private readonly postulacionRepository: Repository<Postulacion>,
    @InjectRepository(ResponsableLaboratorio)
    private readonly responsableRepository: Repository<ResponsableLaboratorio>,
  ) {}

  /**
   * Alumno se postula → notificación in-app al RESPONSABLE del laboratorio.
   * No se envía email.
   */
  @OnEvent(POSTULACION_CREADA)
  async handlePostulacionCreada(
    payload: PostulacionCreadaEvent,
  ): Promise<void> {
    try {
      const postulacion = await this.postulacionRepository.findOne({
        where: { id: payload.postulacionId },
        relations: [
          'alumno',
          'alumno.usuario',
          'proyecto',
          'proyecto.laboratorio',
        ],
      });

      if (!postulacion) return;

      const { alumno, proyecto } = postulacion;
      const laboratorioId = proyecto.laboratorio.id;

      // Buscar al responsable del laboratorio
      const responsable = await this.responsableRepository.findOne({
        where: { laboratorio: { id: laboratorioId } },
        relations: ['usuario'],
      });

      if (!responsable) return;

      const mensaje = `${alumno.nombre} ${alumno.apellido} se postuló al proyecto "${proyecto.titulo}".`;

      await this.notificationsService.create({
        usuarioId: responsable.usuario.id,
        postulacion,
        tipo: NotificationType.NUEVA_POSTULACION,
        mensaje,
        emailEnviado: false,
      });
    } catch (error) {
      this.logger.error(
        `Error procesando evento ${POSTULACION_CREADA}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Responsable acepta/rechaza → notificación in-app al ALUMNO + email al ALUMNO.
   */
  @OnEvent(POSTULACION_ESTADO_ACTUALIZADO)
  async handleEstadoActualizado(
    payload: PostulacionEstadoActualizadoEvent,
  ): Promise<void> {
    if (payload.nuevoEstado === PostulacionEstado.PENDIENTE) return;

    try {
      const postulacion = await this.postulacionRepository.findOne({
        where: { id: payload.postulacionId },
        relations: ['alumno', 'alumno.usuario', 'proyecto'],
      });

      if (!postulacion) return;

      const { alumno, proyecto } = postulacion;
      const estadoTexto =
        payload.nuevoEstado === PostulacionEstado.ACEPTADA
          ? 'aceptada'
          : 'rechazada';

      const mensaje = `Tu postulación al proyecto "${proyecto.titulo}" fue ${estadoTexto}.`;

      // Notificación in-app
      await this.notificationsService.create({
        usuarioId: alumno.usuario.id,
        postulacion,
        tipo: NotificationType.ESTADO_ACTUALIZADO,
        mensaje,
        emailEnviado: false,
      });

      // Email asíncrono al alumno (no bloquea)
      void this.emailService
        .sendEstadoActualizado({
          alumnoEmail: alumno.usuario.email,
          alumnoNombre: alumno.nombre,
          proyectoTitulo: proyecto.titulo,
          nuevoEstado: payload.nuevoEstado,
        })
        .then(async () => {
          // Marcar email como enviado
          await this.notificationsService.create({
            usuarioId: alumno.usuario.id,
            postulacion,
            tipo: NotificationType.ESTADO_ACTUALIZADO,
            mensaje,
            emailEnviado: true,
          });
        })
        .catch((err: Error) =>
          this.logger.error(`Error enviando email: ${err.message}`),
        );
    } catch (error) {
      this.logger.error(
        `Error procesando evento ${POSTULACION_ESTADO_ACTUALIZADO}: ${(error as Error).message}`,
      );
    }
  }
}
