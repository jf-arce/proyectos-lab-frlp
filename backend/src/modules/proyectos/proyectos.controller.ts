import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/roles.guard';
import { Roles } from '@/modules/auth/roles.decorator';
import { UserRole } from '@/modules/users/entities/user.entity';
import { ProyectosService } from './proyectos.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { FilterProyectosDto } from './dto/filter-proyectos.dto';
import { Proyecto } from './entities/proyecto.entity';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
    laboratorioId?: string;
  };
}

@ApiTags('proyectos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}

  @Post('projects')
  @Roles(UserRole.RESPONSABLE_LABORATORIO)
  @ApiOperation({ summary: 'Crear un nuevo proyecto (Solo Responsable)' })
  @ApiResponse({ status: 201, description: 'Proyecto creado.', type: Proyecto })
  @ApiResponse({ status: 403, description: 'No tiene permisos.' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateProyectoDto,
  ): Promise<Proyecto> {
    return this.proyectosService.create(dto, req.user.laboratorioId!);
  }

  @Get('projects')
  @Roles(UserRole.ALUMNO)
  @ApiOperation({ summary: 'Listar proyectos activos (Solo Alumno)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de proyectos activos.',
    type: [Proyecto],
  })
  findAllActive(
    @Query() filters: FilterProyectosDto,
  ): Promise<{ data: Proyecto[]; total: number }> {
    return this.proyectosService.findAllActive(filters);
  }

  @Get('projects/my')
  @Roles(UserRole.RESPONSABLE_LABORATORIO)
  @ApiOperation({ summary: 'Listar proyectos del propio laboratorio' })
  @ApiResponse({
    status: 200,
    description: 'Lista de proyectos.',
    type: [Proyecto],
  })
  findMyProjects(@Req() req: AuthenticatedRequest): Promise<Proyecto[]> {
    return this.proyectosService.findMyProjects(req.user.laboratorioId!);
  }

  @Put('projects/:id')
  @Roles(UserRole.RESPONSABLE_LABORATORIO)
  @ApiOperation({ summary: 'Editar un proyecto existente' })
  @ApiResponse({
    status: 200,
    description: 'Proyecto actualizado.',
    type: Proyecto,
  })
  @ApiResponse({ status: 403, description: 'No es dueño del proyecto.' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado.' })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProyectoDto,
  ): Promise<Proyecto> {
    return this.proyectosService.update(id, dto, req.user.laboratorioId!);
  }

  @Delete('projects/:id')
  @Roles(UserRole.RESPONSABLE_LABORATORIO)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un proyecto' })
  @ApiResponse({ status: 204, description: 'Proyecto eliminado.' })
  @ApiResponse({ status: 403, description: 'No tiene permisos.' })
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.proyectosService.remove(id, req.user.laboratorioId!);
  }

  @Patch('projects/:id/status')
  @Roles(UserRole.RESPONSABLE_LABORATORIO)
  @ApiOperation({
    summary: 'Cambiar el estado de un proyecto (ACTIVO/CERRADO)',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado.',
    type: Proyecto,
  })
  changeStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeStatusDto,
  ): Promise<Proyecto> {
    return this.proyectosService.changeStatus(id, dto, req.user.laboratorioId!);
  }
}
