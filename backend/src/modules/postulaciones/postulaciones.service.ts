import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Proyecto } from '@/modules/proyectos/entities/proyecto.entity';
import { ProyectoEstado } from '@/modules/proyectos/enums/proyectos-estados.enum';
import { AlumnoService } from '@/modules/alumno/alumno.service';
import {
  POSTULACION_CREADA,
  PostulacionCreadaEvent,
} from '@/modules/notifications/events/postulacion-creada.event';
import {
  POSTULACION_ESTADO_ACTUALIZADO,
  PostulacionEstadoActualizadoEvent,
} from '@/modules/notifications/events/postulacion-estado-actualizado.event';
import { Postulacion } from './entities/postulacion.entity';
import { UpdatePostulacionEstadoDto } from './dto/update-postulacion-estado.dto';
import { PostulacionEstado } from './enums/postulacion-estado.enum';

@Injectable()
export class PostulacionesService {
  constructor(
    @InjectRepository(Postulacion)
    private readonly postulacionRepository: Repository<Postulacion>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
    private readonly eventEmitter: EventEmitter2,
    private readonly alumnoService: AlumnoService,
    private readonly dataSource: DataSource,
  ) {}

  async getApplications(
    projectId: string,
    laboratorioId: string,
  ): Promise<Postulacion[]> {
    const proyecto = await this.findProyectoOrFail(projectId);
    this.checkOwnership(proyecto, laboratorioId);

    return this.postulacionRepository.find({
      where: { proyecto: { id: projectId } },
      order: { createdAt: 'DESC' },
    });
  }

  async updateApplicationStatus(
    appId: string,
    dto: UpdatePostulacionEstadoDto,
    laboratorioId: string,
  ): Promise<Postulacion> {
    if (dto.estado === PostulacionEstado.PENDIENTE) {
      throw new BadRequestException('No se puede volver al estado PENDIENTE');
    }

    // Se usa una transacción con lock pesimista sobre la fila para evitar
    // condiciones de carrera (p. ej. doble click) que permitirían procesar
    // la misma postulación dos veces y disparar notificaciones duplicadas.
    const updated = await this.dataSource.transaction(async (manager) => {
      const postulacion = await manager
        .createQueryBuilder(Postulacion, 'postulacion')
        .innerJoinAndSelect('postulacion.proyecto', 'proyecto')
        .innerJoinAndSelect('proyecto.laboratorio', 'laboratorio')
        .where('postulacion.id = :appId', { appId })
        .setLock('pessimistic_write')
        .getOne();

      if (!postulacion) {
        throw new NotFoundException(
          `Postulación con id ${appId} no encontrada`,
        );
      }

      if (postulacion.proyecto.laboratorio.id !== laboratorioId) {
        throw new ForbiddenException(
          'No tenés permiso para modificar esta postulación',
        );
      }

      const esTerminal =
        postulacion.estado === PostulacionEstado.ACEPTADA ||
        postulacion.estado === PostulacionEstado.RECHAZADA;
      if (esTerminal) {
        throw new BadRequestException('La postulación ya fue resuelta');
      }

      postulacion.estado = dto.estado;
      return manager.save(postulacion);
    });

    const event = new PostulacionEstadoActualizadoEvent();
    event.postulacionId = updated.id;
    event.nuevoEstado = updated.estado;
    this.eventEmitter.emit(POSTULACION_ESTADO_ACTUALIZADO, event);

    return updated;
  }

  async getMyApplications(userId: string): Promise<Postulacion[]> {
    const alumno = await this.alumnoService.findByUserId(userId);
    return this.postulacionRepository.find({
      where: { alumno: { id: alumno.id } },
      relations: ['proyecto'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMyApplicationById(
    userId: string,
    appId: string,
  ): Promise<Postulacion> {
    const alumno = await this.alumnoService.findByUserId(userId);
    const postulacion = await this.postulacionRepository.findOne({
      where: { id: appId, alumno: { id: alumno.id } },
      relations: ['proyecto'],
    });

    if (!postulacion) {
      throw new NotFoundException(`Postulación con id ${appId} no encontrada`);
    }

    return postulacion;
  }

  async withdraw(projectId: string, userId: string): Promise<void> {
    const alumno = await this.alumnoService.findByUserId(userId);
    const postulacion = await this.postulacionRepository.findOne({
      where: { proyecto: { id: projectId }, alumno: { id: alumno.id } },
    });

    if (!postulacion) {
      throw new NotFoundException('No estás postulado a este proyecto');
    }

    const yaResuelta =
      postulacion.estado === PostulacionEstado.ACEPTADA ||
      postulacion.estado === PostulacionEstado.RECHAZADA;
    if (yaResuelta) {
      throw new BadRequestException(
        'No se puede retirar una postulación que ya fue resuelta',
      );
    }

    await this.postulacionRepository.remove(postulacion);
  }

  async postular(projectId: string, userId: string): Promise<Postulacion> {
    const proyecto = await this.findProyectoOrFail(projectId);

    if (proyecto.estado !== ProyectoEstado.ACTIVO) {
      throw new BadRequestException(
        'El proyecto no está activo y no acepta postulaciones',
      );
    }

    const alumno = await this.alumnoService.findByUserId(userId);

    const check = await this.postulacionRepository.findOne({
      where: { proyecto: { id: projectId }, alumno: { id: alumno.id } },
    });

    if (check) {
      throw new ConflictException('Ya te postulaste a este proyecto');
    }

    // cupos = 0 significa "sin límite definido" (datos existentes y default de la entity)
    if (proyecto.cupos > 0) {
      const aceptadas = await this.postulacionRepository.count({
        where: {
          proyecto: { id: projectId },
          estado: PostulacionEstado.ACEPTADA,
        },
      });

      if (aceptadas >= proyecto.cupos) {
        throw new BadRequestException(
          'El proyecto ya no tiene cupos disponibles',
        );
      }
    }

    const postulacion = this.postulacionRepository.create({
      proyecto,
      alumno,
      estado: PostulacionEstado.PENDIENTE,
    });
    const saved = await this.postulacionRepository.save(postulacion);

    const event = new PostulacionCreadaEvent();
    event.postulacionId = saved.id;
    this.eventEmitter.emit(POSTULACION_CREADA, event);

    return saved;
  }

  private async findProyectoOrFail(id: string): Promise<Proyecto> {
    const proyecto = await this.proyectoRepository.findOne({ where: { id } });
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con id ${id} no encontrado`);
    }
    return proyecto;
  }

  private checkOwnership(proyecto: Proyecto, laboratorioId: string): void {
    if (proyecto.laboratorio.id !== laboratorioId) {
      throw new ForbiddenException(
        'No tenés permiso para gestionar este proyecto',
      );
    }
  }
}
