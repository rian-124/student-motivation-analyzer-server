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
  const corsOrigin = configService.get<string>(
    'app.corsOrigin',
    'http://localhost:5173',
  );
  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ── Swagger ───────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Student Motivation Analyzer API')
    .setDescription(
      'Dokumentasi API untuk sistem analisis motivasi mahasiswa berbasis AI.\n\n' +
        '**Cara Penggunaan:**\n' +
        '1. Lakukan **POST /api/auth/login** untuk mendapatkan token JWT\n' +
        '2. Klik tombol **Authorize** di kanan atas, masukkan token\n' +
        '3. Semua endpoint yang membutuhkan auth akan otomatis terautentikasi',
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
      'JWT-auth', // nama referensi security scheme
    )
    .addTag('Auth', 'Autentikasi pengguna (login & register)')
    .addTag('Users', 'Manajemen akun pengguna')
    .addTag('Students', 'Manajemen data mahasiswa')
    .addTag('Lecturers', 'Manajemen data dosen')
    .addTag('Recordings', 'Upload dan manajemen rekaman')
    .addTag('Motivation Analysis', 'Analisis motivasi mahasiswa berbasis AI')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // token tidak hilang saat refresh
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Student Motivation Analyzer — API Docs',
  });
  // ─────────────────────────────────────────────────────────────────────────

  // Start Server
  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
  logger.log(`🚀 Server berjalan di: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📄 Swagger Docs: http://localhost:${port}/docs`);
}
bootstrap();
