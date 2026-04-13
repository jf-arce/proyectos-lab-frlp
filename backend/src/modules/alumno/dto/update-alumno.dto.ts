import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class UpdateAlumnoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsString()
  legajo?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  anioEnCurso?: number;

  @IsOptional()
  @IsString()
  bio?: string | null;

  @IsOptional()
  @IsUrl()
  cvUrl?: string | null;
}
