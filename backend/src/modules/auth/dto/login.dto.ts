import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'juan@utn.edu.ar', description: 'Email del usuario' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'password123',
    minLength: 8,
    description: 'Contraseña',
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
