import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Laboratorio } from '@/modules/laboratorio/entities/laboratorio.entity';

@Entity('responsable_laboratorio')
export class ResponsableLaboratorio {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: User;

  @ManyToOne(() => Laboratorio)
  @JoinColumn({ name: 'laboratorio_id' })
  laboratorio!: Laboratorio;

  @Column()
  nombre!: string;

  @Column()
  apellido!: string;
}
