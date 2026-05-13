import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { FlaskAnalysisResponse } from '../../common/interfaces/motivation-analysis.interface';

@Injectable()
export class MotivationAnalysisService {
  private readonly logger = new Logger(MotivationAnalysisService.name);
  private readonly flaskApiUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.flaskApiUrl =
      this.configService.get<string>('FLASK_API_URL') ||
      'http://localhost:5000';
  }

  /**
   * Mengirim audio ke Flask API, mendapatkan hasil analisis, dan menyimpannya ke DB
   */
  async analyzeAndSave(file: Express.Multer.File, dto: CreateAnalysisDto) {
    try {
      this.logger.log(`Starting analysis for student: ${dto.studentId}`);

      const formData = new FormData();
      // Mengirim buffer file ke Flask
      formData.append(
        'file',
        new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }),
        file.originalname,
      );

      // 1. Panggil Flask API
      const response = await axios.post<FlaskAnalysisResponse>(
        `${this.flaskApiUrl}/api/audio/process`,
        formData,
        {
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        },
      );

      const { transcription, prediction, mfcc } = response.data.data;

      // 2. Simpan hasil ke Database
      const analysis = await this.prisma.motivationAnalysis.create({
        data: {
          studentId: dto.studentId,
          description: dto.description,
          transcription,
          prediction: prediction.prediction,
          confidence: prediction.confidence,
          probabilities: prediction.probabilities,
          mfcc,
        },
      });

      this.logger.log(`Analysis saved successfully with ID: ${analysis.id}`);
      return analysis;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`AI Analysis failed: ${errorMessage}`);

      if (axios.isAxiosError(error) && error.response) {
        this.logger.error(
          `Flask Error Response: ${JSON.stringify(error.response.data)}`,
        );
      }
      throw new InternalServerErrorException(
        'Gagal memproses analisis motivasi via AI',
      );
    }
  }

  async findByStudent(studentId: string) {
    return this.prisma.motivationAnalysis.findMany({
      where: { studentId },
      include: {
        student: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.motivationAnalysis.findMany({
        skip,
        take: limit,
        include: {
          student: {
            include: {
              class: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.motivationAnalysis.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.motivationAnalysis.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            class: true,
            lecturer: true,
          },
        },
      },
    });
  }
}
