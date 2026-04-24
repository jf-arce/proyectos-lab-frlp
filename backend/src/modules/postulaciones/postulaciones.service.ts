import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Proyecto } from '@/modules/proyectos/entities/proyecto.entity';
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
    const postulacion = await this.postulacionRepository.findOne({
      where: { id: appId },
      relations: { proyecto: { laboratorio: true } },
    });

    if (!postulacion) {
      throw new NotFoundException(`Postulación con id ${appId} no encontrada`);
    }

    if (postulacion.proyecto.laboratorio.id !== laboratorioId) {
      throw new ForbiddenException(
        'No tenés permiso para modificar esta postulación',
      );
    }

    if (dto.estado === PostulacionEstado.PENDIENTE) {
      throw new BadRequestException('No se puede volver al estado PENDIENTE');
    }

    postulacion.estado = dto.estado;
    const updated = await this.postulacionRepository.save(postulacion);

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

  async postular(projectId: string, userId: string): Promise<Postulacion> {
    const proyecto = await this.findProyectoOrFail(projectId);
    const alumno = await this.alumnoService.findByUserId(userId);

    const check = await this.postulacionRepository.findOne({
      where: { proyecto: { id: projectId }, alumno: { id: alumno.id } },
    });

    if (check) {
      throw new BadRequestException('Ya te postulaste a este proyecto');
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
