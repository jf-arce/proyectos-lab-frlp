import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  findAll(): Promise<Skill[]> {
    return this.skillRepository.find({ order: { nombre: 'ASC' } });
  }

  async findById(id: string): Promise<Skill> {
    const skill = await this.skillRepository.findOneBy({ id });
    if (!skill) {
      throw new NotFoundException(`Skill con id ${id} no encontrada`);
    }
    return skill;
  }

  create(data: {
    nombre: string;
    categoria: string | null;
    esPredefinida: boolean;
    creadaPorAlumnoId: string | null;
  }): Promise<Skill> {
    const skill = this.skillRepository.create(data);
    return this.skillRepository.save(skill);
  }
}
