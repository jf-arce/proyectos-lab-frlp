import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Alumno } from './entities/alumno.entity';
import { CreateAlumnoDto } from './dto/create-alumno.dto';

@Injectable()
export class AlumnoService {
  constructor(
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
  ) {}

  async create(
    usuarioId: string,
    dto: CreateAlumnoDto,
    manager?: EntityManager,
  ): Promise<Alumno> {
    const repo = manager
      ? manager.getRepository(Alumno)
      : this.alumnoRepository;

    const alumno = repo.create({
      usuario: { id: usuarioId },
      nombre: dto.nombre,
      apellido: dto.apellido,
      legajo: dto.legajo,
      anioEnCurso: dto.anioEnCurso,
      bio: null,
      cvUrl: null,
      cvArchivoPath: null,
    });
    return repo.save(alumno);
  }
}
