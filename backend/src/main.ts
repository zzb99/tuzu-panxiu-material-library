import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mkdirSync } from 'node:fs';
import { AppModule } from './app.module';
import { resolveUploadDir } from './config/paths';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const configuredUploadDir = config.getOrThrow<string>('UPLOAD_DIR');
  const uploadDir = resolveUploadDir(configuredUploadDir);

  mkdirSync(uploadDir, { recursive: true });
  app.useStaticAssets(uploadDir, { prefix: '/uploads/' });
  app.setGlobalPrefix('api');
  const allowedOrigins = (config.get<string>('CORS_ORIGINS') || 'http://localhost:5173,http://localhost:5174')
    .split(',').map((origin) => origin.trim()).filter(Boolean);
  app.enableCors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.some((allowed) => originMatches(origin, allowed))) return callback(null, true);
      return callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  const swaggerConfig = new DocumentBuilder().setTitle('土族盘绣纹样开放素材库 API').setVersion('1.0').addBearerAuth().build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(config.getOrThrow<number>('BACKEND_PORT'));
}

void bootstrap();

function originMatches(origin: string, allowed: string): boolean {
  if (!allowed.includes('*')) return origin === allowed;
  const escaped = allowed.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*');
  return new RegExp(`^${escaped}$`).test(origin);
}
