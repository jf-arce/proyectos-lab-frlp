import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('laboratorio')
export class Laboratorio {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre!: string;

  @Column()
  descripcion!: string;

  @Column({ name: 'email_contacto', nullable: true, type: 'varchar' })
  emailContacto!: string | null;
}
