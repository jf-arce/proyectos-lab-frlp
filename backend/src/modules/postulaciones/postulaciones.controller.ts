import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
  @ApiOperation({ summary: 'Aceptar o rechazar una postulación' })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado.',
    type: Postulacion,
  })
  @ApiResponse({
    status: 400,
    description: 'Estado inválido (no se puede volver a PENDIENTE).',
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
}
