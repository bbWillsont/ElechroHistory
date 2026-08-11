// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api'); // все роуты под /api — совпадает с vite proxy
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }), // лишние поля отбрасываются
  );
  app.enableCors();

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 API запущен: http://localhost:${port}/api`);
}
bootstrap();
