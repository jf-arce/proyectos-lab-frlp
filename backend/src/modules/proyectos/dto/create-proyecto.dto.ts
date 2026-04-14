import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProyectoDto {
  @ApiProperty({ example: 'Desarrollo de Portal de Proyectos' })
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @ApiProperty({ example: 'Descripción detallada del proyecto...' })
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440005'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  skillIds?: string[];
}
