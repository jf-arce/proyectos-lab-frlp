import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { validationSchema } from './config/validation.schema';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { LaboratorioModule } from '@/modules/laboratorio/laboratorio.module';
import { AlumnoModule } from '@/modules/alumno/alumno.module';
import { ResponsableLaboratorioModule } from '@/modules/responsable-laboratorio/responsable-laboratorio.module';

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
    UsersModule,
    AuthModule,
    LaboratorioModule,
    AlumnoModule,
    ResponsableLaboratorioModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
