import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Laboratorio } from '@/modules/laboratorio/entities/laboratorio.entity';
import { Skill } from '@/modules/skills/entities/skill.entity';
import { ProyectoEstado } from '../enums/proyectos-estados.enum';
import { Postulacion } from '@/modules/postulaciones/entities/postulacion.entity';

@Entity('proyecto')
export class Proyecto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'Desarrollo de Portal de Proyectos' })
  @Column()
  titulo!: string;

  @ApiProperty({ example: 'Descripción detallada del proyecto...' })
  @Column('text')
  descripcion!: string;

  @ApiProperty({ enum: ProyectoEstado, default: ProyectoEstado.ACTIVO })
  @Column({
    type: 'enum',
    enum: ProyectoEstado,
    default: ProyectoEstado.ACTIVO,
  })
  estado!: ProyectoEstado;

  @ApiProperty({ example: 2 })
  @Column({ type: 'int', default: 0 })
  cupos!: number;

  @ApiProperty({ example: '1 año' })
  @Column({ nullable: true })
  duracion!: string;

  @ApiProperty({ example: '2024-12-31' })
  @Column({ type: 'date', nullable: true, name: 'fecha_cierre' })
  fechaCierre!: Date | null;

  @ApiProperty({ type: () => Laboratorio })
  @ManyToOne(() => Laboratorio, { eager: true })
  @JoinColumn({ name: 'laboratorio_id' })
  laboratorio!: Laboratorio;

  @ApiProperty({ type: () => [Skill] })
  @ManyToMany(() => Skill, { eager: true })
  @JoinTable({
    name: 'proyecto_skill',
    joinColumn: { name: 'proyecto_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skill_id', referencedColumnName: 'id' },
  })
  skills!: Skill[];

  @OneToMany(() => Postulacion, (p) => p.proyecto)
  postulaciones!: Postulacion[];

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
