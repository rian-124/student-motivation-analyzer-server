import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';
import { TransformInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Global API Prefix
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  app.setGlobalPrefix(apiPrefix);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Response Transform Interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS
  const corsOrigins = configService
    .get<string>('app.corsOrigin', 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: [...corsOrigins, 'http://localhost:3000', 'http://localhost:5000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ── Swagger ───────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Student Motivation Analyzer API')
    .setDescription(
      'Dokumentasi API untuk sistem analisis motivasi mahasiswa berbasis AI.\n\n' +
        '**Fitur Otomatisasi:**\n' +
        '- Token akan disimpan otomatis meskipun halaman di-refresh.\n' +
        '- Cukup login sekali, dan semua endpoint akan langsung bisa diakses.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Masukkan JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Token tetap ada setelah refresh
      displayRequestDuration: true,
      filter: true,
    },
    customSiteTitle: 'Student Motivation Analyzer — API Docs',
  });
  // ─────────────────────────────────────────────────────────────────────────

  const port = configService.get<number>('app.port', 3001);
  await app.listen(port);
  logger.log(`🚀 Server berjalan di: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📄 Swagger Docs: http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error('Bootsrap gagal:', err);
  process.exit(1);
});
