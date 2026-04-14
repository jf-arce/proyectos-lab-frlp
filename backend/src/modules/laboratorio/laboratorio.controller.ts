import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LaboratorioService } from './laboratorio.service';
import { Laboratorio } from './entities/laboratorio.entity';

@ApiTags('laboratorios')
@Controller('laboratorios')
export class LaboratorioController {
  constructor(private readonly laboratorioService: LaboratorioService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los laboratorios registrados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de laboratorios obtenida exitosamente.',
    type: [Laboratorio],
  })
  findAll(): Promise<Laboratorio[]> {
    return this.laboratorioService.findAll();
  }
}
