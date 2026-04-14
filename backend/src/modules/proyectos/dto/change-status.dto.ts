import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ProyectoEstado } from '../enums/proyectos-estados.enum';

export class ChangeStatusDto {
  @ApiProperty({ enum: ProyectoEstado, example: ProyectoEstado.CERRADO })
  @IsEnum(ProyectoEstado)
  estado!: ProyectoEstado;
}
