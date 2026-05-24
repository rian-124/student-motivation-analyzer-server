import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { PrismaService } from '../../database/prisma.service';

describe('StudentsService', () => {
  let service: StudentsService;

  const prismaMock = {
    user: { findUnique: jest.fn() },
    student: { findUnique: jest.fn() },
    class: { upsert: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.todo('should create a student');
  it.todo('should return a list of students');
  it.todo('should return a list of students with pagination');
  it.todo('should return a message with the given id for findOne');
  it.todo('should return a message with the given id for update');
  it.todo('should return a message with the given id for remove');
});
