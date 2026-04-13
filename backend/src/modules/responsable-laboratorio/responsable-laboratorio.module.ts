import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponsableLaboratorio } from './entities/responsable-laboratorio.entity';
import { ResponsableLaboratorioService } from './responsable-laboratorio.service';

@Module({
  imports: [TypeOrmModule.forFeature([ResponsableLaboratorio])],
  providers: [ResponsableLaboratorioService],
  exports: [ResponsableLaboratorioService],
})
export class ResponsableLaboratorioModule {}
