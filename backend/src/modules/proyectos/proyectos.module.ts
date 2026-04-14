import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/modules/auth/auth.module';
import { SkillsModule } from '@/modules/skills/skills.module';
import { ProyectosController } from './proyectos.controller';
import { ProyectosService } from './proyectos.service';
import { Proyecto } from './entities/proyecto.entity';
import { Postulacion } from './entities/postulacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proyecto, Postulacion]),
    AuthModule,
    SkillsModule,
  ],
  controllers: [ProyectosController],
  providers: [ProyectosService],
  exports: [ProyectosService],
})
export class ProyectosModule {}
