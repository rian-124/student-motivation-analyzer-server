import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import type { Server } from 'http';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from './../src/common/filters';
import { TransformInterceptor } from './../src/common/interceptors';

describe('API E2E Tests', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Setup sama seperti main.ts
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Auth Endpoints ────────────────────────────────────────────────────────

  describe('Auth', () => {
    describe('POST /api/auth/login', () => {
      it('should return 201 with message', () => {
        return request(server)
          .post('/api/auth/login')
          .send({ email: 'test@email.com', password: 'password123' })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('statusCode', 201);
            expect(res.body).toHaveProperty('message', 'Success');
            expect(res.body).toHaveProperty('data');
          });
      });

      it('should return 400 when body is invalid', () => {
        return request(server)
          .post('/api/auth/login')
          .send({ email: 'bukan-email', password: '' })
          .expect(400);
      });

      it('should return 400 when body is empty', () => {
        return request(server).post('/api/auth/login').send({}).expect(400);
      });
    });

    describe('POST /api/auth/register', () => {
      it('should return 201 with message', () => {
        return request(server)
          .post('/api/auth/register')
          .send({})
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('statusCode', 201);
            expect(res.body).toHaveProperty('data');
          });
      });
    });
  });

  // ── Students Endpoints ────────────────────────────────────────────────────

  describe('Students', () => {
    describe('GET /api/students', () => {
      it('should return 200 with standard response format', () => {
        return request(server)
          .get('/api/students')
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('statusCode', 200);
            expect(res.body).toHaveProperty('message', 'Success');
            expect(res.body).toHaveProperty('data');
          });
      });

      it('should accept pagination query params', () => {
        return request(server).get('/api/students?page=1&limit=5').expect(200);
      });
    });

    describe('POST /api/students', () => {
      it('should return 201 when data is valid', () => {
        return request(server)
          .post('/api/students')
          .send({ nim: '2021001', name: 'Budi Santoso' })
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('statusCode', 201);
            expect(res.body).toHaveProperty('data');
          });
      });

      it('should return 400 when nim is missing', () => {
        return request(server)
          .post('/api/students')
          .send({ name: 'Budi Santoso' })
          .expect(400);
      });

      it('should return 400 when name is missing', () => {
        return request(server)
          .post('/api/students')
          .send({ nim: '2021001' })
          .expect(400);
      });

      it('should return 400 when body is empty', () => {
        return request(server).post('/api/students').send({}).expect(400);
      });
    });

    describe('GET /api/students/:id', () => {
      it('should return 200 with data for valid id', () => {
        return request(server)
          .get('/api/students/uuid-test')
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('statusCode', 200);
            expect(res.body).toHaveProperty('data');
          });
      });
    });

    describe('PUT /api/students/:id', () => {
      it('should return 200 when update data is valid', () => {
        return request(server)
          .put('/api/students/uuid-test')
          .send({ name: 'Budi Updated' })
          .expect(200);
      });
    });

    describe('DELETE /api/students/:id', () => {
      it('should return 200 when deleting', () => {
        return request(server).delete('/api/students/uuid-test').expect(200);
      });
    });
  });

  // ── Lecturers Endpoints ───────────────────────────────────────────────────

  describe('Lecturers', () => {
    describe('GET /api/lecturers', () => {
      it('should return 200 with standard response format', () => {
        return request(server)
          .get('/api/lecturers')
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('statusCode', 200);
            expect(res.body).toHaveProperty('data');
          });
      });
    });

    describe('POST /api/lecturers', () => {
      it('should return 201 when data is valid', () => {
        return request(server)
          .post('/api/lecturers')
          .send({ nip: '198501012010011001', name: 'Dr. Ahmad Fauzi' })
          .expect(201);
      });

      it('should return 400 when nip is missing', () => {
        return request(server)
          .post('/api/lecturers')
          .send({ name: 'Dr. Ahmad Fauzi' })
          .expect(400);
      });
    });
  });

  // ── Recordings Endpoints ──────────────────────────────────────────────────

  describe('Recordings', () => {
    describe('GET /api/recordings', () => {
      it('should return 200 with standard response format', () => {
        return request(server)
          .get('/api/recordings')
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('statusCode', 200);
            expect(res.body).toHaveProperty('data');
          });
      });
    });
  });

  // ── Motivation Analysis Endpoints ─────────────────────────────────────────

  describe('Motivation Analysis', () => {
    describe('GET /api/motivation-analysis', () => {
      it('should return 200 with standard response format', () => {
        return request(server)
          .get('/api/motivation-analysis')
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('statusCode', 200);
            expect(res.body).toHaveProperty('data');
          });
      });
    });

    describe('POST /api/motivation-analysis', () => {
      it('should return 201 when data is valid', () => {
        return request(server)
          .post('/api/motivation-analysis')
          .send({ recordingId: 'uuid-rekaman', studentId: 'uuid-mahasiswa' })
          .expect(201);
      });

      it('should return 400 when recordingId is missing', () => {
        return request(server)
          .post('/api/motivation-analysis')
          .send({ studentId: 'uuid-mahasiswa' })
          .expect(400);
      });
    });

    describe('GET /api/motivation-analysis/student/:studentId', () => {
      it('should return 200 with data for valid studentId', () => {
        return request(server)
          .get('/api/motivation-analysis/student/uuid-mahasiswa')
          .expect(200);
      });
    });
  });

  // ── Global Error Handling ────────────────────────────────────────────────

  describe('Global Error Handling', () => {
    it('should return 404 with error format for unknown route', () => {
      return request(server)
        .get('/api/route-yang-tidak-ada')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('path');
        });
    });
  });
});
