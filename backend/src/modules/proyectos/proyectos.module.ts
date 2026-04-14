import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/modules/auth/auth.module';
import { SkillsModule } from '@/modules/skills/skills.module';
import { PostulacionesModule } from '@/modules/postulaciones/postulaciones.module';
import { ProyectosController } from './proyectos.controller';
import { ProyectosService } from './proyectos.service';
import { Proyecto } from './entities/proyecto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proyecto]),
    AuthModule,
    SkillsModule,
    PostulacionesModule,
  ],
  controllers: [ProyectosController],
  providers: [ProyectosService],
  exports: [ProyectosService, PostulacionesModule],
})
export class ProyectosModule {}
