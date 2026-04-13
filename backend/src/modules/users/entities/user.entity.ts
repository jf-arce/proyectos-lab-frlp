import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRole {
  ALUMNO = 'ALUMNO',
  RESPONSABLE_LABORATORIO = 'RESPONSABLE_LABORATORIO',
}

@Entity('usuario')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: UserRole })
  rol!: UserRole;

  @Column({ name: 'laboratorio_id', type: 'uuid', nullable: true })
  laboratorioId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
