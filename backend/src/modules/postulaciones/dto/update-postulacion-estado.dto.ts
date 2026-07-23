import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PostulacionEstado } from '../enums/postulacion-estado.enum';

export class UpdatePostulacionEstadoDto {
  @ApiProperty({
    enum: PostulacionEstado,
    example: PostulacionEstado.EN_REVISION,
    description:
      'Nuevo estado de la postulación: EN_REVISION, ACEPTADA o RECHAZADA. No se puede volver a PENDIENTE ni modificar una postulación ya resuelta.',
  })
  @IsEnum(PostulacionEstado)
  estado!: PostulacionEstado;
}
