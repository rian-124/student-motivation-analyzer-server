import { Test, TestingModule } from '@nestjs/testing';
import { MotivationAnalysisService } from './motivation-analysis.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';

describe('MotivationAnalysisService', () => {
  let service: MotivationAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MotivationAnalysisService],
    }).compile();

    service = module.get<MotivationAnalysisService>(MotivationAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyze()', () => {
    it('should return a message when analysis is started', () => {
      const dto: CreateAnalysisDto = {
        recordingId: 'uuid-rekaman',
        studentId: 'uuid-mahasiswa',
        notes: 'Mahasiswa terlihat kurang antusias',
      };

      const result = service.analyze(dto);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
    });
  });

  describe('findAll()', () => {
    it('should return a message when called', () => {
      const result = service.findAll();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
    });
  });

  describe('findOne()', () => {
    it('should return a message with the given id', () => {
      const id = 'uuid-analisis';
      const result = service.findOne(id);

      expect(result).toBeDefined();
      expect((result as any).message).toContain(id);
    });
  });

  describe('findByStudent()', () => {
    it('should return a message with the given studentId', () => {
      const studentId = 'uuid-mahasiswa';
      const result = service.findByStudent(studentId);

      expect(result).toBeDefined();
      expect((result as any).message).toContain(studentId);
    });
  });
});
