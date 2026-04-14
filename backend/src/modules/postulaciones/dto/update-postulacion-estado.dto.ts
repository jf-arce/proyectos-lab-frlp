import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PostulacionEstado } from '../enums/postulacion-estado.enum';

export class UpdatePostulacionEstadoDto {
  @ApiProperty({
    enum: PostulacionEstado,
    example: PostulacionEstado.ACEPTADA,
    description: 'Estado de la postulación (no se puede volver a PENDIENTE)',
  })
  @IsEnum(PostulacionEstado)
  estado!: PostulacionEstado;
}
