import { IsString, IsUUID } from 'class-validator';

export class CreateResponsableDto {
  @IsString()
  nombre!: string;

  @IsString()
  apellido!: string;

  @IsUUID()
  laboratorioId!: string;
}
