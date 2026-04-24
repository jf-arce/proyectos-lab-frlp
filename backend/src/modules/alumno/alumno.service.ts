import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SkillsService } from '@/modules/skills/skills.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { AddSkillDto } from './dto/add-skill.dto';
import { Alumno } from './entities/alumno.entity';

@Injectable()
export class AlumnoService {
  constructor(
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
    private readonly skillsService: SkillsService,
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
      skills: [],
    });
    return repo.save(alumno);
  }

  async findByUserId(userId: string): Promise<Alumno> {
    const alumno = await this.alumnoRepository.findOne({
      where: { usuario: { id: userId } },
    });
    if (!alumno) {
      throw new NotFoundException('Perfil de alumno no encontrado');
    }
    return alumno;
  }

  async findById(id: string): Promise<Alumno> {
    const alumno = await this.alumnoRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!alumno) {
      throw new NotFoundException('Alumno no encontrado');
    }
    return alumno;
  }

  async updateProfile(userId: string, dto: UpdateAlumnoDto): Promise<Alumno> {
    const alumno = await this.findByUserId(userId);

    const updates = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    ) as Partial<Alumno>;

    Object.assign(alumno, updates);
    return this.alumnoRepository.save(alumno);
  }

  async addSkill(userId: string, dto: AddSkillDto): Promise<Alumno> {
    if (!dto.skillId && !dto.nombre) {
      throw new BadRequestException('Se requiere skillId o nombre');
    }

    const alumno = await this.findByUserId(userId);

    let skillId: string;

    if (dto.skillId) {
      const skill = await this.skillsService.findById(dto.skillId);
      skillId = skill.id;
      if (alumno.skills.some((s) => s.id === skillId)) {
        return alumno;
      }
      alumno.skills = [...alumno.skills, skill];
    } else {
      const skill = await this.skillsService.create({
        nombre: dto.nombre!,
        categoria: dto.categoria ?? null,
        esPredefinida: false,
        creadaPorAlumnoId: alumno.id,
      });
      alumno.skills = [...alumno.skills, skill];
    }

    return this.alumnoRepository.save(alumno);
  }

  async removeSkill(userId: string, skillId: string): Promise<void> {
    const alumno = await this.findByUserId(userId);

    const initialLength = alumno.skills.length;
    alumno.skills = alumno.skills.filter((s) => s.id !== skillId);

    if (alumno.skills.length === initialLength) {
      throw new NotFoundException('Habilidad no encontrada en el perfil');
    }

    await this.alumnoRepository.save(alumno);
  }
}
