import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ResponsableLaboratorio } from './entities/responsable-laboratorio.entity';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { UpdateResponsableDto } from './dto/update-responsable.dto';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class ResponsableLaboratorioService {
  constructor(
    @InjectRepository(ResponsableLaboratorio)
    private readonly responsableRepository: Repository<ResponsableLaboratorio>,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
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

  async update(
    usuarioId: string,
    dto: UpdateResponsableDto,
  ): Promise<ResponsableLaboratorio> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const responsable = await this.findByUsuarioId(usuarioId);
      if (!responsable) {
        throw new Error('Responsable no encontrado');
      }

      // 1. Update Responsable info
      if (dto.nombre) responsable.nombre = dto.nombre;
      if (dto.apellido) responsable.apellido = dto.apellido;
      await queryRunner.manager.save(ResponsableLaboratorio, responsable);

      // 2. Update User info (email/password)
      if (dto.email || dto.password) {
        await this.usersService.update(
          usuarioId,
          { email: dto.email, password: dto.password },
          queryRunner.manager,
        );
      }

      await queryRunner.commitTransaction();
      return (await this.findByUsuarioId(usuarioId))!;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
