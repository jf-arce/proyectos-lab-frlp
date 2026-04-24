import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Laboratorio } from './entities/laboratorio.entity';

@Injectable()
export class LaboratorioService {
  constructor(
    @InjectRepository(Laboratorio)
    private readonly laboratorioRepository: Repository<Laboratorio>,
  ) {}

  findAll(): Promise<Laboratorio[]> {
    return this.laboratorioRepository.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: string): Promise<Laboratorio> {
    const lab = await this.laboratorioRepository.findOne({ where: { id } });
    if (!lab) throw new Error('Laboratorio no encontrado');
    return lab;
  }
}
