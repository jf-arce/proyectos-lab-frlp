import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('skill')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre!: string;

  @Column({ nullable: true, type: 'varchar' })
  categoria!: string | null;

  @Column({ name: 'es_predefinida' })
  esPredefinida!: boolean;

  @Column({ name: 'creada_por_alumno_id', nullable: true, type: 'uuid' })
  creadaPorAlumnoId!: string | null;
}
