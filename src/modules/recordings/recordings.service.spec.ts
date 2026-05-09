import { Test, TestingModule } from '@nestjs/testing';
import { RecordingsService } from './recordings.service';
import { CreateRecordingDto } from './dto/create-recording.dto';

describe('RecordingsService', () => {
  let service: RecordingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecordingsService],
    }).compile();

    service = module.get<RecordingsService>(RecordingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload()', () => {
    it('should return a message when file is uploaded', () => {
      const mockFile = {
        originalname: 'rekaman.mp4',
        mimetype: 'video/mp4',
        size: 1024,
        buffer: Buffer.from(''),
      } as any;

      const dto: CreateRecordingDto = {
        studentId: 'uuid-mahasiswa',
        subject: 'Pemrograman Web',
        description: 'Sesi bimbingan',
      };

      const result = service.upload(mockFile, dto);

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
      const id = 'uuid-rekaman';
      const result = service.findOne(id);

      expect(result).toBeDefined();
      expect((result as any).message).toContain(id);
    });
  });

  describe('remove()', () => {
    it('should return a message with the given id', () => {
      const id = 'uuid-rekaman';
      const result = service.remove(id);

      expect(result).toBeDefined();
      expect((result as any).message).toContain(id);
    });
  });
});
