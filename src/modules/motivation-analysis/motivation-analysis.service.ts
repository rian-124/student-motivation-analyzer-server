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
      return this.transformAnalysis(analysis);
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

  private transformAnalysis(analysis: any) {
    if (!analysis) return null;
    
    let mfccData = analysis.mfcc;
    
    if (typeof mfccData === 'string') {
      try {
        mfccData = JSON.parse(mfccData);
      } catch (e) {
        this.logger.error(`Failed to parse MFCC string: ${e.message}`);
      }
    }

    if (!mfccData || !Array.isArray(mfccData) || mfccData.length === 0) {
      return {
        ...analysis,
        metrics: {
          energy: 0,
          speed: 0,
          pitch: 0,
          fluency: 0,
          articulation: 0,
        },
      };
    }

    let averages: number[];

    // Cek apakah data MFCC 1D (hanya mean) atau 2D (frames x coeffs)
    if (typeof mfccData[0] === 'number') {
      // Data 1D (Mean yang dikirim Flask)
      averages = mfccData.map(val => Math.abs(val as number));
    } else if (Array.isArray(mfccData[0])) {
      // Data 2D (Frames x Coeffs)
      const numFrames = mfccData.length;
      const numCoeffs = (mfccData[0] as number[]).length;
      averages = new Array(numCoeffs).fill(0);

      for (const frame of mfccData) {
        for (let i = 0; i < numCoeffs; i++) {
          averages[i] += Math.abs(frame[i]);
        }
      }

      for (let i = 0; i < numCoeffs; i++) {
        averages[i] /= numFrames;
      }
    } else {
      this.logger.error(`Unknown MFCC data format for analysis ${analysis.id}`);
      return analysis;
    }

    // Normalisasi nilai ke 0-100 (estimasi berdasarkan magnitudo tipikal MFCC)
    // Nilai max diatur agar proporsional (heuristik)
    const normalize = (val: number, max: number) => Math.min(Math.round((val / max) * 100), 100);

    // Pemetaan dari MFCC (13 coeffs) ke metrik manusia
    // MFCC 0: Energi/Volume
    const energy = normalize(averages[0] || 0, 40); 
    
    // MFCC 1-3: Low frequency (Spectral tilt / Speed approximation)
    const speed = normalize(((averages[1] || 0) + (averages[2] || 0)) / 2, 20);
    
    // MFCC 4-6: Middle frequency (Pitch variation)
    const pitch = normalize(((averages[4] || 0) + (averages[5] || 0) + (averages[6] || 0)) / 3, 15);
    
    // MFCC 7-9: Mid-High (Fluency/Stability)
    const fluency = normalize(((averages[7] || 0) + (averages[8] || 0) + (averages[9] || 0)) / 3, 12);
    
    // MFCC 10-12: High frequency (Articulation/Clarity)
    const articulation = normalize(((averages[10] || 0) + (averages[11] || 0) + (averages[12] || 0)) / 3, 10);


    return {
      ...analysis,
      metrics: {
        energy,
        speed,
        pitch,
        fluency,
        articulation,
      },
    };
  }

  async findByStudent(studentId: string) {
    const results = await this.prisma.motivationAnalysis.findMany({
      where: { studentId },
      include: {
        student: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return results.map((item) => this.transformAnalysis(item));
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
      data: data.map((item) => this.transformAnalysis(item)),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }


  async findOne(id: string) {
    const analysis = await this.prisma.motivationAnalysis.findUnique({
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
    return this.transformAnalysis(analysis);
  }

  async getStudentGraphData(studentId: string) {
    // 1. Get Student Info
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { classId: true, name: true },
    });

    if (!student || !student.classId) {
      throw new InternalServerErrorException('Data mahasiswa atau kelas tidak ditemukan');
    }

    // 2. Get All Analyses for this Class
    const classAnalyses = await this.prisma.motivationAnalysis.findMany({
      where: {
        student: {
          classId: student.classId,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // 3. Get Personal Analyses
    const personalAnalyses = classAnalyses.filter((a) => a.studentId === studentId);
    const latestPersonal = personalAnalyses.length > 0 ? personalAnalyses[personalAnalyses.length - 1] : null;
    const prevPersonal = personalAnalyses.length > 1 ? personalAnalyses[personalAnalyses.length - 2] : null;

    // 4. Calculate Weekly Trend (Class Average)
    const weeklyDataMap = new Map<string, { total: number; count: number }>();
    classAnalyses.forEach((a) => {
      const date = new Date(a.createdAt);
      // Get week number or just use YYYY-WW format
      const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`; 
      const current = weeklyDataMap.get(weekKey) || { total: 0, count: 0 };
      weeklyDataMap.set(weekKey, {
        total: current.total + (a.confidence * 100),
        count: current.count + 1,
      });
    });

    const weeklyTrend = Array.from(weeklyDataMap.entries()).map(([label, val]) => ({
      label,
      value: Math.round(val.total / val.count),
    }));

    // 5. Calculate Benchmarking (Latest Personal vs Class Average)
    const transformedClass = classAnalyses.map((a) => this.transformAnalysis(a));
    const transformedPersonal = latestPersonal ? this.transformAnalysis(latestPersonal) : null;

    const classAvgMetrics = {
      energy: 0,
      speed: 0,
      pitch: 0,
      fluency: 0,
      articulation: 0,
    };

    transformedClass.forEach((a: any) => {
      classAvgMetrics.energy += a.metrics.energy;
      classAvgMetrics.speed += a.metrics.speed;
      classAvgMetrics.pitch += a.metrics.pitch;
      classAvgMetrics.fluency += a.metrics.fluency;
      classAvgMetrics.articulation += a.metrics.articulation;
    });

    const numClass = transformedClass.length || 1;
    const benchmark = [
      { subject: 'Motivasi Diri', A: transformedPersonal?.metrics.energy || 0, B: Math.round(classAvgMetrics.energy / numClass) },
      { subject: 'Tujuan Belajar', A: transformedPersonal?.metrics.speed || 0, B: Math.round(classAvgMetrics.speed / numClass) },
      { subject: 'Percaya Diri', A: transformedPersonal?.metrics.pitch || 0, B: Math.round(classAvgMetrics.pitch / numClass) },
      { subject: 'Konsistensi', A: transformedPersonal?.metrics.fluency || 0, B: Math.round(classAvgMetrics.fluency / numClass) },
      { subject: 'Kejelasan', A: transformedPersonal?.metrics.articulation || 0, B: Math.round(classAvgMetrics.articulation / numClass) },
    ];

    // 6. Personal Stats (Latest, Activity, Avg, Growth)
    const avgPersonalScore = personalAnalyses.length > 0 
      ? Math.round(personalAnalyses.reduce((acc, curr) => acc + (curr.confidence * 100), 0) / personalAnalyses.length)
      : 0;

    const growth = latestPersonal && prevPersonal 
      ? Math.round(((latestPersonal.confidence - prevPersonal.confidence) / prevPersonal.confidence) * 100)
      : 0;

    return {
      weeklyTrend,
      benchmark,
      stats: {
        latestStatus: latestPersonal?.prediction || 'N/A',
        activityCount: personalAnalyses.length,
        avgScore: avgPersonalScore,
        growth: growth,
      },
    };
  }


}
