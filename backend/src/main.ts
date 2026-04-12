import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Proyectos Lab FRLP')
    .setDescription('API del portal de proyectos de laboratorio - UTN FRLP')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(PORT);
}

bootstrap()
  .then(() => {
    console.log(`Application is running on: http://localhost:${PORT}/api`);
  })
  .catch((err) => {
    console.error('Error starting the application:', err);
    process.exit(1);
  });
