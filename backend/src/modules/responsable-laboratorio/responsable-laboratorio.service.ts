import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ResponsableLaboratorio } from './entities/responsable-laboratorio.entity';
import { CreateResponsableDto } from './dto/create-responsable.dto';

@Injectable()
export class ResponsableLaboratorioService {
  constructor(
    @InjectRepository(ResponsableLaboratorio)
    private readonly responsableRepository: Repository<ResponsableLaboratorio>,
  ) {}

  async create(
    usuarioId: string,
    dto: CreateResponsableDto,
    manager?: EntityManager,
  ): Promise<ResponsableLaboratorio> {
    const repo = manager
      ? manager.getRepository(ResponsableLaboratorio)
      : this.responsableRepository;

    const responsable = repo.create({
      usuario: { id: usuarioId },
      laboratorio: { id: dto.laboratorioId },
      nombre: dto.nombre,
      apellido: dto.apellido,
    });
    return repo.save(responsable);
  }

  async findByUsuarioId(
    usuarioId: string,
  ): Promise<ResponsableLaboratorio | null> {
    return this.responsableRepository.findOne({
      where: { usuario: { id: usuarioId } },
      relations: ['laboratorio'],
    });
  }
}
