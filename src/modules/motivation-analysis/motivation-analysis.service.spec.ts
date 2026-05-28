import { Test, TestingModule } from '@nestjs/testing';
import { MotivationAnalysisService } from './motivation-analysis.service';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('MotivationAnalysisService', () => {
  let service: MotivationAnalysisService;

  const prismaMock = {
    motivationAnalysis: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
    },
  };
  const configMock = {
    get: jest.fn().mockReturnValue('http://localhost:5000'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MotivationAnalysisService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<MotivationAnalysisService>(MotivationAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.todo('should return analysis results');
  it.todo('should return a list of analysis results');
  it.todo('should return an analysis result');
  it.todo('should return analysis history for a student');
});
