import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './entities/notificacion.entity';
import { NotificationType } from './enums/notification-type.enum';
import { Postulacion } from '@/modules/postulaciones/entities/postulacion.entity';

interface CreateNotificacionParams {
  usuarioId: string;
  postulacion: Postulacion | null;
  tipo: NotificationType;
  mensaje: string;
  emailEnviado?: boolean;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
  ) {}

  async create(params: CreateNotificacionParams): Promise<Notificacion> {
    const notificacion = this.notificacionRepository.create({
      usuario: { id: params.usuarioId },
      postulacion: params.postulacion,
      tipo: params.tipo,
      mensaje: params.mensaje,
      leida: false,
      emailEnviado: params.emailEnviado ?? false,
    });
    return this.notificacionRepository.save(notificacion);
  }

  findByUser(usuarioId: string): Promise<Notificacion[]> {
    return this.notificacionRepository.find({
      where: { usuario: { id: usuarioId } },
      relations: ['postulacion'],
      order: { createdAt: 'DESC' },
    });
  }

  getUnreadCount(usuarioId: string): Promise<number> {
    return this.notificacionRepository.count({
      where: { usuario: { id: usuarioId }, leida: false },
    });
  }

  async markAsRead(id: string, usuarioId: string): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.findOne({
      where: { id, usuario: { id: usuarioId } },
    });
    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }
    notificacion.leida = true;
    return this.notificacionRepository.save(notificacion);
  }

  async markAllAsRead(usuarioId: string): Promise<void> {
    await this.notificacionRepository.update(
      { usuario: { id: usuarioId }, leida: false },
      { leida: true },
    );
  }
}
