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

  findById(id: string): Promise<Laboratorio | null> {
    return this.laboratorioRepository.findOne({ where: { id } });
  }
}
