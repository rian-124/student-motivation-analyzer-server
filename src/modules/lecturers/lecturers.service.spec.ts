import { Test, TestingModule } from '@nestjs/testing';
import { LecturersService } from './lecturers.service';
import { PrismaService } from '../../database/prisma.service';

describe('LecturersService', () => {
  let service: LecturersService;

  const prismaMock = {
    user: { findUnique: jest.fn() },
    lecturer: { findUnique: jest.fn(), update: jest.fn() },
    class: { upsert: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LecturersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<LecturersService>(LecturersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.todo('should create a lecturer');
  it.todo('should return a list of lecturers');
  it.todo('should return a message with the given id for findOne');
  it.todo('should return a message with the given id for update');
  it.todo('should return a message with the given id for remove');
});
