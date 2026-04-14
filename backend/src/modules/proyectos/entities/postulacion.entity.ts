import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Alumno } from '@/modules/alumno/entities/alumno.entity';
import { Proyecto } from './proyecto.entity';
import { PostulacionEstado } from '../enums/proyectos-estados.enum';

@Entity('postulacion')
export class Postulacion {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ type: () => Alumno })
  @ManyToOne(() => Alumno, { eager: true })
  @JoinColumn({ name: 'alumno_id' })
  alumno!: Alumno;

  @ApiProperty({ type: () => Proyecto })
  @ManyToOne(() => Proyecto, (p) => p.postulaciones)
  @JoinColumn({ name: 'proyecto_id' })
  proyecto!: Proyecto;

  @ApiProperty({ enum: PostulacionEstado, default: PostulacionEstado.PENDIENTE })
  @Column({
    type: 'enum',
    enum: PostulacionEstado,
    default: PostulacionEstado.PENDIENTE,
  })
  estado!: PostulacionEstado;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
