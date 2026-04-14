import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proyecto } from '@/modules/proyectos/entities/proyecto.entity';
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
    return this.postulacionRepository.save(postulacion);
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
