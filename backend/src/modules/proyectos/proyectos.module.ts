import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/modules/auth/auth.module';
import { SkillsModule } from '@/modules/skills/skills.module';
import { PostulacionesModule } from '@/modules/postulaciones/postulaciones.module';
import { Alumno } from '@/modules/alumno/entities/alumno.entity';
import { Postulacion } from '@/modules/postulaciones/entities/postulacion.entity';
import { ProyectosController } from './proyectos.controller';
import { ProyectosService } from './proyectos.service';
import { MatchingService } from './matching.service';
import { Proyecto } from './entities/proyecto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proyecto, Alumno, Postulacion]),
    AuthModule,
    SkillsModule,
    PostulacionesModule,
  ],
  controllers: [ProyectosController],
  providers: [ProyectosService, MatchingService],
  exports: [ProyectosService, MatchingService, PostulacionesModule],
})
export class ProyectosModule {}
