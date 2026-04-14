import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laboratorio } from './entities/laboratorio.entity';
import { LaboratorioController } from './laboratorio.controller';
import { LaboratorioService } from './laboratorio.service';

@Module({
  imports: [TypeOrmModule.forFeature([Laboratorio])],
  controllers: [LaboratorioController],
  providers: [LaboratorioService],
  exports: [LaboratorioService],
})
export class LaboratorioModule {}

