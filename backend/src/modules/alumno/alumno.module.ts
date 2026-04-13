import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillsModule } from '@/modules/skills/skills.module';
import { AlumnoController } from './alumno.controller';
import { AlumnoService } from './alumno.service';
import { Alumno } from './entities/alumno.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alumno]), SkillsModule],
  controllers: [AlumnoController],
  providers: [AlumnoService],
  exports: [AlumnoService],
})
export class AlumnoModule {}
