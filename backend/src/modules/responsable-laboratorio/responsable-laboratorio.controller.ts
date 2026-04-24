import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponsableLaboratorioService } from './responsable-laboratorio.service';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { UserRole } from '@/modules/users/entities/user.entity';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
    laboratorioId?: string;
  };
}

@ApiTags('responsable-laboratorio')
@Controller('responsable-laboratorio')
@UseGuards(JwtAuthGuard)
export class ResponsableLaboratorioController {
  constructor(private readonly responsableService: ResponsableLaboratorioService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener el perfil del responsable logueado' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
  async getMe(@Req() req: AuthenticatedRequest) {
    return this.responsableService.findByUsuarioId(req.user.userId);
  }
}
