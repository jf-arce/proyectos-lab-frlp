import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Postulacion } from '@/modules/postulaciones/entities/postulacion.entity';
import { ResponsableLaboratorio } from '@/modules/responsable-laboratorio/entities/responsable-laboratorio.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsListener } from './notifications.listener';
import { EmailService } from './email.service';
import { Notificacion } from './entities/notificacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notificacion, Postulacion, ResponsableLaboratorio]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsListener, EmailService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
