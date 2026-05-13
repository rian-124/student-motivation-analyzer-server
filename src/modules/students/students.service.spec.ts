import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

describe('StudentsService', () => {
  let service: StudentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentsService],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create a student', async () => {
      const dto: CreateStudentDto = {
        nim: '2021001',
        name: 'Budi Santoso',
        email: 'budi@student.com',
        password: 'password123',
        class: 'TI-A',
        semester: '5',
      };

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result.nim).toBe(dto.nim);
    });
  });

  describe('findAll()', () => {
    it('should return a list of students', async () => {
      const result = await service.findAll();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('data');
    });

    it('should return a list of students with pagination', async () => {
      const result = await service.findAll(1, 10);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('data');
    });
  });

  describe('findOne()', () => {
    it('should return a message with the given id', () => {
      const id = 'uuid-mahasiswa';
      const result = service.findOne(id);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
      expect((result as any).message).toContain(id);
    });
  });

  describe('update()', () => {
    it('should return a message with the given id', () => {
      const id = 'uuid-mahasiswa';
      const dto: UpdateStudentDto = { name: 'Budi Updated' };
      const result = service.update(id, dto);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
      expect((result as any).message).toContain(id);
    });
  });

  describe('remove()', () => {
    it('should return a message with the given id', () => {
      const id = 'uuid-mahasiswa';
      const result = service.remove(id);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
      expect((result as any).message).toContain(id);
    });
  });
});
