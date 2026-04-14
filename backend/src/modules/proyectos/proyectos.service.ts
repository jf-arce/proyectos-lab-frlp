import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillsService } from '@/modules/skills/skills.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { UpdatePostulacionEstadoDto } from './dto/update-postulacion-estado.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { Proyecto } from './entities/proyecto.entity';
import { Postulacion } from './entities/postulacion.entity';
import { PostulacionEstado } from './enums/proyectos-estados.enum';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
    @InjectRepository(Postulacion)
    private readonly postulacionRepository: Repository<Postulacion>,
    private readonly skillsService: SkillsService,
  ) {}

  async create(
    dto: CreateProyectoDto,
    laboratorioId: string,
  ): Promise<Proyecto> {
    const skills = await this.resolveSkills(dto.skillIds);

    const proyecto = this.proyectoRepository.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      laboratorio: { id: laboratorioId },
      skills,
    });

    return this.proyectoRepository.save(proyecto);
  }

  findMyProjects(laboratorioId: string): Promise<Proyecto[]> {
    return this.proyectoRepository.find({
      where: { laboratorio: { id: laboratorioId } },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    dto: UpdateProyectoDto,
    laboratorioId: string,
  ): Promise<Proyecto> {
    const proyecto = await this.findOneOrFail(id);
    this.checkOwnership(proyecto, laboratorioId);

    if (dto.titulo !== undefined) proyecto.titulo = dto.titulo;
    if (dto.descripcion !== undefined) proyecto.descripcion = dto.descripcion;
    if (dto.skillIds !== undefined) {
      proyecto.skills = await this.resolveSkills(dto.skillIds);
    }

    return this.proyectoRepository.save(proyecto);
  }

  async remove(id: string, laboratorioId: string): Promise<void> {
    const proyecto = await this.findOneOrFail(id);
    this.checkOwnership(proyecto, laboratorioId);
    await this.proyectoRepository.remove(proyecto);
  }

  async changeStatus(
    id: string,
    dto: ChangeStatusDto,
    laboratorioId: string,
  ): Promise<Proyecto> {
    const proyecto = await this.findOneOrFail(id);
    this.checkOwnership(proyecto, laboratorioId);

    proyecto.estado = dto.estado;
    return this.proyectoRepository.save(proyecto);
  }

  async getApplications(
    projectId: string,
    laboratorioId: string,
  ): Promise<Postulacion[]> {
    const proyecto = await this.findOneOrFail(projectId);
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

  private async findOneOrFail(id: string): Promise<Proyecto> {
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

  private async resolveSkills(skillIds?: string[]) {
    if (!skillIds || skillIds.length === 0) return [];
    return Promise.all(skillIds.map((id) => this.skillsService.findById(id)));
  }
}
