import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
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

  @ApiPropertyOptional({
    example: 'uuid-del-laboratorio',
    description: 'Requerido si el rol es RESPONSABLE_LABORATORIO',
  })
  @IsOptional()
  @IsUUID()
  laboratoryId?: string;
}
