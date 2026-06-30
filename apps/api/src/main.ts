import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { validateEnv } from './config/env';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    // trustProxy: behind a managed-platform load balancer (Render) so the app
    // sees the real protocol/IP — needed for Secure cookies over HTTPS.
    new FastifyAdapter({ trustProxy: true }),
    { bufferLogs: true },
  );

  const env = validateEnv(process.env);

  await app.register(fastifyCookie, { secret: env.AUTH_SECRET });

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: env.CORS_ORIGINS,
    credentials: true,
    allowedHeaders: ['content-type', 'x-srd-user-id', 'x-srd-platform-role', 'x-srd-vendor-id', 'x-srd-vendor-role'],
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Silk Road Drive API')
    .setDescription('Tourist car-rental marketplace for Uzbekistan')
    .setVersion('0.0.1')
    .addCookieAuth('session')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Managed platforms inject PORT; fall back to API_PORT locally.
  const port = Number(process.env.PORT) || env.API_PORT;
  await app.listen({ port, host: '0.0.0.0' });
  // eslint-disable-next-line no-console
  console.log(`API ready → :${port}/api/v1  (docs: /api/docs)`);
}

void bootstrap();
