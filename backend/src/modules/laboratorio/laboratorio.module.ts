import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laboratorio } from './entities/laboratorio.entity';
import { LaboratorioService } from './laboratorio.service';

@Module({
  imports: [TypeOrmModule.forFeature([Laboratorio])],
  providers: [LaboratorioService],
  exports: [LaboratorioService],
})
export class LaboratorioModule {}
