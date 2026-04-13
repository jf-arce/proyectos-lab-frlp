import { IsInt, IsString, Min } from 'class-validator';

export class CreateAlumnoDto {
  @IsString()
  nombre!: string;

  @IsString()
  apellido!: string;

  @IsString()
  legajo!: string;

  @IsInt()
  @Min(1)
  anioEnCurso!: number;
}
