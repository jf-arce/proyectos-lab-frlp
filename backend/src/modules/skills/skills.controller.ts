import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { SkillsService } from './skills.service';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';

@UseGuards(JwtAuthGuard)
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  findAll(): Promise<Skill[]> {
    return this.skillsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateSkillDto): Promise<Skill> {
    return this.skillsService.create({
      nombre: dto.nombre,
      categoria: dto.categoria ?? null,
      esPredefinida: false,
      creadaPorAlumnoId: null,
    });
  }
}
