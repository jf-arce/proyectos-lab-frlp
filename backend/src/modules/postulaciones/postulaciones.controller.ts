import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { PostulacionesService } from './postulaciones.service';
import { UpdatePostulacionEstadoDto } from './dto/update-postulacion-estado.dto';
import { Postulacion } from './entities/postulacion.entity';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
    laboratorioId?: string;
  };
}

@ApiTags('postulaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PostulacionesController {
  constructor(private readonly postulacionesService: PostulacionesService) {}

  @Get('projects/:id/applications')
  @Roles(UserRole.RESPONSABLE_LABORATORIO)
  @ApiOperation({ summary: 'Ver postulaciones recibidas para un proyecto' })
  @ApiResponse({
    status: 200,
    description: 'Lista de postulaciones.',
    type: [Postulacion],
  })
  getApplications(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Postulacion[]> {
    return this.postulacionesService.getApplications(
      id,
      req.user.laboratorioId!,
    );
  }

  @Patch('applications/:id/status')
  @Roles(UserRole.RESPONSABLE_LABORATORIO)
  @ApiOperation({
    summary: 'Marcar en revisión, aceptar o rechazar una postulación',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado.',
    type: Postulacion,
  })
  @ApiResponse({
    status: 400,
    description:
      'Estado inválido (no se puede volver a PENDIENTE ni modificar una postulación ya resuelta).',
  })
  updateApplicationStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostulacionEstadoDto,
  ): Promise<Postulacion> {
    return this.postulacionesService.updateApplicationStatus(
      id,
      dto,
      req.user.laboratorioId!,
    );
  }

  @Get('applications/my')
  @Roles(UserRole.ALUMNO)
  @ApiOperation({ summary: 'Listar mis postulaciones' })
  @ApiResponse({ status: 200, type: [Postulacion] })
  getMyApplications(@Req() req: AuthenticatedRequest): Promise<Postulacion[]> {
    return this.postulacionesService.getMyApplications(req.user.userId);
  }

  // Debe declararse después de 'applications/my' para que 'my' no matchee como :id
  @Get('applications/:id')
  @Roles(UserRole.ALUMNO)
  @ApiOperation({ summary: 'Ver el detalle de una postulación propia' })
  @ApiResponse({ status: 200, type: Postulacion })
  @ApiResponse({
    status: 404,
    description: 'Postulación no encontrada o no pertenece al alumno.',
  })
  getMyApplicationById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Postulacion> {
    return this.postulacionesService.getMyApplicationById(req.user.userId, id);
  }

  @Delete('projects/:id/apply')
  @Roles(UserRole.ALUMNO)
  @ApiOperation({ summary: 'Retirar mi postulación a un proyecto' })
  @ApiResponse({ status: 200, description: 'Postulación retirada.' })
  @ApiResponse({
    status: 400,
    description: 'Solo se puede retirar una postulación pendiente.',
  })
  @ApiResponse({
    status: 404,
    description: 'El alumno no está postulado a este proyecto.',
  })
  withdraw(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.postulacionesService.withdraw(id, req.user.userId);
  }

  @Post('projects/:id/apply')
  @Roles(UserRole.ALUMNO)
  @ApiOperation({ summary: 'Postularse a un proyecto' })
  @ApiResponse({
    status: 201,
    description: 'Postulación creada exitosamente.',
    type: Postulacion,
  })
  @ApiResponse({
    status: 400,
    description: 'El proyecto no está activo o no tiene cupos disponibles.',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya te postulaste a este proyecto.',
  })
  apply(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Postulacion> {
    return this.postulacionesService.postular(id, req.user.userId);
  }
}
