import { ApiProperty } from '@nestjs/swagger';

// Agregar @ApiProperty() a cada campo cuando se definan las propiedades del DTO.
// Ejemplo:
//   @ApiProperty({ example: 'juan@example.com' })
//   email: string;
export class CreateUserDto {}
