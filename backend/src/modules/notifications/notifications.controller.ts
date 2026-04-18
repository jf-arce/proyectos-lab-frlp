import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { NotificationsService } from './notifications.service';
import { Notificacion } from './entities/notificacion.entity';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificaciones del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificaciones.',
    type: [Notificacion],
  })
  findByUser(@Req() req: AuthenticatedRequest): Promise<Notificacion[]> {
    return this.notificationsService.findByUser(req.user.userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  @ApiResponse({
    status: 200,
    description: 'Notificación marcada como leída.',
    type: Notificacion,
  })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada.' })
  markAsRead(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Notificacion> {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({
    status: 204,
    description: 'Todas las notificaciones marcadas como leídas.',
  })
  markAllAsRead(@Req() req: AuthenticatedRequest): Promise<void> {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }
}
