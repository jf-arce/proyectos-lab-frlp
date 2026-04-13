import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alumno } from './entities/alumno.entity';
import { AlumnoService } from './alumno.service';

@Module({
  imports: [TypeOrmModule.forFeature([Alumno])],
  providers: [AlumnoService],
  exports: [AlumnoService],
})
export class AlumnoModule {}
