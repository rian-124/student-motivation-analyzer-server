import { Test, TestingModule } from '@nestjs/testing';
import { LecturersService } from './lecturers.service';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';

describe('LecturersService', () => {
  let service: LecturersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LecturersService],
    }).compile();

    service = module.get<LecturersService>(LecturersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create a lecturer', async () => {
      const dto: CreateLecturerDto = {
        nip: '198501012010011001',
        name: 'Dr. Ahmad Fauzi, M.Kom',
        email: 'ahmad@lecturer.com',
        password: 'password123',
        department: 'Teknik Informatika',
      };

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(result.nip).toBe(dto.nip);
    });
  });

  describe('findAll()', () => {
    it('should return a list of lecturers', async () => {
      const result = await service.findAll();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('data');
    });
  });

  describe('findOne()', () => {
    it('should return a message with the given id', () => {
      const id = 'uuid-dosen';
      const result = service.findOne(id);

      expect(result).toBeDefined();
      expect((result as any).message).toContain(id);
    });
  });

  describe('update()', () => {
    it('should return a message with the given id', () => {
      const id = 'uuid-dosen';
      const dto: UpdateLecturerDto = { name: 'Dr. Ahmad Updated' };
      const result = service.update(id, dto);

      expect(result).toBeDefined();
      expect((result as any).message).toContain(id);
    });
  });

  describe('remove()', () => {
    it('should return a message with the given id', () => {
      const id = 'uuid-dosen';
      const result = service.remove(id);

      expect(result).toBeDefined();
      expect((result as any).message).toContain(id);
    });
  });
});
