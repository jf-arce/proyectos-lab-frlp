import { Controller, Get, Param } from '@nestjs/common';
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

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un laboratorio por ID' })
  @ApiResponse({
    status: 200,
    description: 'Laboratorio obtenido exitosamente.',
    type: Laboratorio,
  })
  findOne(@Param('id') id: string): Promise<Laboratorio> {
    return this.laboratorioService.findOne(id);
  }
}
