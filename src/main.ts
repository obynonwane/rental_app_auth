import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('/api/v1');

  app.use(cookieParser());

  const PORT = 80;
  // const PORT = 5001;
  await app.listen(PORT);
}
bootstrap();
