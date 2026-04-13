import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Skill } from '@/modules/skills/entities/skill.entity';

@Entity('alumno')
export class Alumno {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: User;

  @Column()
  legajo!: string;

  @Column()
  nombre!: string;

  @Column()
  apellido!: string;

  @Column({ name: 'anio_en_curso' })
  anioEnCurso!: number;

  @Column({ nullable: true, type: 'varchar' })
  bio!: string | null;

  @Column({ name: 'cv_url', nullable: true, type: 'varchar' })
  cvUrl!: string | null;

  @Column({ name: 'cv_archivo_path', nullable: true, type: 'varchar' })
  cvArchivoPath!: string | null;

  @ManyToMany(() => Skill, { eager: true })
  @JoinTable({
    name: 'alumno_skill',
    joinColumn: { name: 'alumno_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skill_id', referencedColumnName: 'id' },
  })
  skills!: Skill[];

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
