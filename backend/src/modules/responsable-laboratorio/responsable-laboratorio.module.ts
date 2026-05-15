import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponsableLaboratorio } from './entities/responsable-laboratorio.entity';
import { ResponsableLaboratorioService } from './responsable-laboratorio.service';
import { ResponsableLaboratorioController } from './responsable-laboratorio.controller';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([ResponsableLaboratorio]), UsersModule],
  controllers: [ResponsableLaboratorioController],
  providers: [ResponsableLaboratorioService],
  exports: [ResponsableLaboratorioService],
})
export class ResponsableLaboratorioModule {}
