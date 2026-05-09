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
    it('should return a message when student is created', () => {
      const dto: CreateStudentDto = {
        nim: '2021001',
        name: 'Budi Santoso',
        class: 'TI-A',
        semester: '5',
      };

      const result = service.create(dto);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
    });
  });

  describe('findAll()', () => {
    it('should return a message when called without params', () => {
      const result = service.findAll();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
    });

    it('should return a message when called with page and limit', () => {
      const result = service.findAll(1, 10);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
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
