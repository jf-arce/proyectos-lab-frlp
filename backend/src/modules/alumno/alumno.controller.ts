import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/roles.guard';
import { Roles } from '@/modules/auth/roles.decorator';
import { UserRole } from '@/modules/users/entities/user.entity';
import { AlumnoService } from './alumno.service';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { AddSkillDto } from './dto/add-skill.dto';
import { Alumno } from './entities/alumno.entity';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ALUMNO)
@Controller('profile')
export class AlumnoController {
  constructor(private readonly alumnoService: AlumnoService) {}

  @Get('me')
  getProfile(@Req() req: AuthenticatedRequest): Promise<Alumno> {
    return this.alumnoService.findByUserId(req.user.userId);
  }

  @Put('me')
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateAlumnoDto,
  ): Promise<Alumno> {
    return this.alumnoService.updateProfile(req.user.userId, dto);
  }

  @Post('me/skills')
  addSkill(
    @Req() req: AuthenticatedRequest,
    @Body() dto: AddSkillDto,
  ): Promise<Alumno> {
    return this.alumnoService.addSkill(req.user.userId, dto);
  }

  @Delete('me/skills/:skillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeSkill(
    @Req() req: AuthenticatedRequest,
    @Param('skillId', ParseUUIDPipe) skillId: string,
  ): Promise<void> {
    return this.alumnoService.removeSkill(req.user.userId, skillId);
  }
}
