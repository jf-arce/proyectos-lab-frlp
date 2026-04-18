import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { databaseConfig } from './config/database.config';
import { validationSchema } from './config/validation.schema';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { LaboratorioModule } from '@/modules/laboratorio/laboratorio.module';
import { AlumnoModule } from '@/modules/alumno/alumno.module';
import { ResponsableLaboratorioModule } from '@/modules/responsable-laboratorio/responsable-laboratorio.module';
import { SkillsModule } from '@/modules/skills/skills.module';
import { ProyectosModule } from '@/modules/proyectos/proyectos.module';
import { PostulacionesModule } from '@/modules/postulaciones/postulaciones.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validationSchema,
      validationOptions: { abortEarly: true, allowUnknown: true },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get('NODE_ENV') === 'development';
        return {
          type: 'postgres',
          host: config.get('database.host'),
          port: config.get('database.port'),
          username: config.get('database.username'),
          password: config.get('database.password'),
          database: config.get('database.database'),
          autoLoadEntities: true,
          synchronize: isDev,
          migrationsRun: !isDev,
          migrations: ['dist/migrations/*.js'],
        };
      },
    }),
    EventEmitterModule.forRoot(),
    UsersModule,
    AuthModule,
    LaboratorioModule,
    AlumnoModule,
    ResponsableLaboratorioModule,
    SkillsModule,
    ProyectosModule,
    PostulacionesModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
