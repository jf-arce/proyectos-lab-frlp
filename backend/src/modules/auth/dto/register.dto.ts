import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { UserRole } from '@/modules/users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'juan@utn.edu.ar', description: 'Email del usuario' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'password123',
    minLength: 8,
    description: 'Contraseña (mínimo 8 caracteres)',
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: UserRole, description: 'Rol del usuario en el sistema' })
  @IsEnum(UserRole)
  rol!: UserRole;

  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del usuario' })
  @IsString()
  apellido!: string;

  // Campos requeridos solo para ALUMNO

  @ApiPropertyOptional({
    example: '12345',
    description: 'Legajo universitario (requerido para ALUMNO)',
  })
  @ValidateIf((o: RegisterDto) => o.rol === UserRole.ALUMNO)
  @IsString()
  legajo?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'Año de la carrera que está cursando (requerido para ALUMNO)',
  })
  @ValidateIf((o: RegisterDto) => o.rol === UserRole.ALUMNO)
  @IsInt()
  @Min(1)
  anioEnCurso?: number;

  // Campo requerido solo para RESPONSABLE_LABORATORIO

  @ApiPropertyOptional({
    example: 'uuid-del-laboratorio',
    description: 'ID del laboratorio (requerido para RESPONSABLE_LABORATORIO)',
  })
  @ValidateIf((o: RegisterDto) => o.rol === UserRole.RESPONSABLE_LABORATORIO)
  @IsUUID()
  laboratorioId?: string;
}
