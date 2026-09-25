import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Allow our web page (Live Server) to call this API
  app.enableCors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
