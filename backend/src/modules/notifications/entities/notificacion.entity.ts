import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Postulacion } from '@/modules/postulaciones/entities/postulacion.entity';
import { NotificationType } from '../enums/notification-type.enum';

@Entity('notificacion')
export class Notificacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: User;

  @ManyToOne(() => Postulacion, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'postulacion_id' })
  postulacion!: Postulacion | null;

  @Column({ type: 'enum', enum: NotificationType })
  tipo!: NotificationType;

  @Column('text')
  mensaje!: string;

  @Column({ default: false })
  leida!: boolean;

  @Column({ name: 'email_enviado', default: false })
  emailEnviado!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
