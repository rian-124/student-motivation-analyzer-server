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

  describe('analyzeAndSave()', () => {
    it('should return analysis results', async () => {
      const dto: CreateAnalysisDto = {
        studentId: 'uuid-mahasiswa',
        description: 'Mahasiswa terlihat kurang antusias',
      };
      const file = { buffer: Buffer.from('test'), mimetype: 'audio/wav', originalname: 'test.wav' } as any;

      // Note: This test will likely fail at runtime without proper mocking of axios and prisma
      const result = await service.analyzeAndSave(file, dto);

      expect(result).toBeDefined();
    });
  });

  describe('findAll()', () => {
    it('should return a list of analysis results', async () => {
      const result = await service.findAll();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('data');
    });
  });

  describe('findOne()', () => {
    it('should return an analysis result', async () => {
      const id = 'uuid-analisis';
      const result = await service.findOne(id);
      expect(result).toBeDefined();
    });
  });

  describe('findByStudent()', () => {
    it('should return analysis history for a student', async () => {
      const studentId = 'uuid-mahasiswa';
      const result = await service.findByStudent(studentId);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
