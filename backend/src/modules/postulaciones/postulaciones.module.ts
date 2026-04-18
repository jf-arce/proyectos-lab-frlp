import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/modules/auth/auth.module';
import { Proyecto } from '@/modules/proyectos/entities/proyecto.entity';
import { AlumnoModule } from '@/modules/alumno/alumno.module';
import { PostulacionesController } from './postulaciones.controller';
import { PostulacionesService } from './postulaciones.service';
import { Postulacion } from './entities/postulacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Postulacion, Proyecto]),
    AuthModule,
    AlumnoModule,
  ],
  controllers: [PostulacionesController],
  providers: [PostulacionesService],
  exports: [PostulacionesService],
})
export class PostulacionesModule {}
