import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
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

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @Min(1)
  @IsOptional()
  cupos?: number;

  @ApiPropertyOptional({ example: '1 año' })
  @IsString()
  @IsOptional()
  duracion?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsString()
  @IsOptional()
  fechaCierre?: string;
}
