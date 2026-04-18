import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumno } from '@/modules/alumno/entities/alumno.entity';
import { Postulacion } from '@/modules/postulaciones/entities/postulacion.entity';
import { Proyecto } from './entities/proyecto.entity';
import { ProyectoEstado } from './enums/proyectos-estados.enum';

export interface ScoredProject {
  score: number;
  project: Proyecto;
}

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
    @InjectRepository(Postulacion)
    private readonly postulacionRepository: Repository<Postulacion>,
  ) {}

  async getRecommendations(userId: string): Promise<ScoredProject[]> {
    // 1. Obtener el perfil del alumno con sus skills
    const alumno = await this.alumnoRepository.findOne({
      where: { usuario: { id: userId } },
      relations: ['skills'],
    });

    const studentSkillIds = new Set(
      (alumno?.skills ?? []).map((s) => s.id),
    );

    // 2. Obtener todos los proyectos ACTIVOS con skills y laboratorio
    const projects = await this.proyectoRepository.find({
      where: { estado: ProyectoEstado.ACTIVO },
      relations: ['skills', 'laboratorio'],
    });

    // 3. Obtener IDs de proyectos ya postulados por el alumno
    const applications = alumno
      ? await this.postulacionRepository.find({
          where: { alumno: { id: alumno.id } },
          relations: ['proyecto'],
        })
      : [];

    const appliedProjectIds = new Set(
      applications.map((a) => a.proyecto.id),
    );

    // 4. Calcular score y ordenar
    return projects
      .filter((p) => !appliedProjectIds.has(p.id))
      .map((p) => {
        const required = p.skills.length;
        if (required === 0) return { score: 0, project: p };
        const matches = p.skills.filter((s) =>
          studentSkillIds.has(s.id),
        ).length;
        return { score: matches / required, project: p };
      })
      .sort((a, b) => b.score - a.score);
  }
}
