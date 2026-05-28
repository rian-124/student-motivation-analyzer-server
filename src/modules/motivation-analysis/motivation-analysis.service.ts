import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { Prisma } from '@prisma/client';
import {
  AnalysisRecord,
  AnalysisMetrics,
  AnalysisProbability,
  FlaskAnalysisResponse,
  MotivationAnalysisResponse,
  StudentGraphData,
} from './types';

@Injectable()
export class MotivationAnalysisService {
  private readonly logger = new Logger(MotivationAnalysisService.name);
  private readonly flaskApiUrl: string;
  private readonly motivationLabels: Record<string, string> = {
    '1': 'Sangat Rendah',
    '2': 'Rendah',
    '3': 'Cukup',
    '4': 'Tinggi',
    '5': 'Sangat Tinggi',
  };

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
    } catch (error: Error | string) {
      this.logger.error(
        `AI Analysis failed: ${error instanceof Error ? error.message : error}`,
      );

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

  private extractNumericArray(value: Prisma.JsonValue | null): number[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter((item): item is number => typeof item === 'number');
  }

  private extractMfcc(value: Prisma.JsonValue | null): number[] | number[][] {
    if (!Array.isArray(value) || value.length === 0) {
      return [];
    }

    const first = value[0];
    if (typeof first === 'number') {
      return value.filter((item): item is number => typeof item === 'number');
    }

    if (Array.isArray(first)) {
      const frames = value.filter((item): item is Prisma.JsonArray =>
        Array.isArray(item),
      );
      return frames
        .map((frame) =>
          frame.filter((item): item is number => typeof item === 'number'),
        )
        .filter((frame) => frame.length > 0);
    }

    return [];
  }

  private emptyMetrics(): AnalysisMetrics {
    return {
      energy: 0,
      speed: 0,
      pitch: 0,
      fluency: 0,
      articulation: 0,
    };
  }

  private transformAnalysis(
    analysis: AnalysisRecord | null,
  ): MotivationAnalysisResponse | null {
    if (!analysis) return null;

    const mfccData = this.extractMfcc(analysis.mfcc);
    const predictionCode = String(analysis.prediction ?? '');
    const predictionLabel =
      this.motivationLabels[predictionCode] ||
      predictionCode ||
      'Tidak diketahui';
    const confidence = Number(analysis.confidence ?? 0);
    const confidencePercent = Math.round(confidence * 1000) / 10;
    const rawProbabilities = this.extractNumericArray(analysis.probabilities);
    const probabilities: AnalysisProbability[] = rawProbabilities.map(
      (value: number, index: number) => ({
        code: String(index + 1),
        label: this.motivationLabels[String(index + 1)] ?? `Kelas ${index + 1}`,
        value,
        percentage: Math.round(Number(value ?? 0) * 1000) / 10,
      }),
    );
    const student =
      'student' in analysis && analysis.student
        ? {
            id: analysis.student.id,
            nim: analysis.student.nim,
            name: analysis.student.name,
            semester: analysis.student.semester,
            classId: analysis.student.classId,
            className: analysis.student.class?.name ?? null,
            studyProgramId: analysis.student.studyProgramId,
            studyProgramName: analysis.student.studyProgram?.name ?? null,
            lecturerId: analysis.student.lecturerId,
            lecturerName: analysis.student.lecturer?.name ?? null,
          }
        : undefined;
    const defaultMetrics = this.emptyMetrics();
    const baseResult: Omit<MotivationAnalysisResponse, 'acoustic' | 'metrics'> =
      {
        id: analysis.id,
        studentId: analysis.studentId,
        description: analysis.description,
        transcription: analysis.transcription,
        prediction: predictionLabel,
        predictionCode,
        confidence,
        confidencePercent,
        probabilities,
        result: {
          code: predictionCode,
          label: predictionLabel,
          confidence,
          confidencePercent,
          probabilities,
        },
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
        student,
      };

    if (!mfccData || !Array.isArray(mfccData) || mfccData.length === 0) {
      return {
        ...baseResult,
        acoustic: {
          mfcc: [],
          metrics: defaultMetrics,
        },
        metrics: defaultMetrics,
      };
    }

    let averages: number[];

    // Cek apakah data MFCC 1D (hanya mean) atau 2D (frames x coeffs)
    if (typeof mfccData[0] === 'number') {
      // Data 1D (Mean yang dikirim Flask)
      averages = (mfccData as number[]).map((val) => Math.abs(val));
    } else if (Array.isArray(mfccData[0])) {
      // Data 2D (Frames x Coeffs)
      const numFrames = mfccData.length;
      const numCoeffs = mfccData[0].length;
      averages = new Array<number>(numCoeffs).fill(0);

      for (const frame of mfccData as number[][]) {
        for (let i = 0; i < numCoeffs; i++) {
          averages[i] += Math.abs(frame[i]);
        }
      }

      for (let i = 0; i < numCoeffs; i++) {
        averages[i] /= numFrames;
      }
    } else {
      this.logger.error(`Unknown MFCC data format for analysis ${analysis.id}`);
      return {
        ...baseResult,
        acoustic: {
          mfcc: [],
          metrics: defaultMetrics,
        },
        metrics: defaultMetrics,
      };
    }

    // Normalisasi nilai ke 0-100 (estimasi berdasarkan magnitudo tipikal MFCC)
    // Nilai max diatur agar proporsional (heuristik)
    const normalize = (val: number, max: number) =>
      Math.min(Math.round((val / max) * 100), 100);

    // Pemetaan dari MFCC (13 coeffs) ke metrik manusia
    // MFCC 0: Energi/Volume
    const energy = normalize(averages[0] || 0, 40);

    // MFCC 1-3: Low frequency (Spectral tilt / Speed approximation)
    const speed = normalize(((averages[1] || 0) + (averages[2] || 0)) / 2, 20);

    // MFCC 4-6: Middle frequency (Pitch variation)
    const pitch = normalize(
      ((averages[4] || 0) + (averages[5] || 0) + (averages[6] || 0)) / 3,
      15,
    );

    // MFCC 7-9: Mid-High (Fluency/Stability)
    const fluency = normalize(
      ((averages[7] || 0) + (averages[8] || 0) + (averages[9] || 0)) / 3,
      12,
    );

    // MFCC 10-12: High frequency (Articulation/Clarity)
    const articulation = normalize(
      ((averages[10] || 0) + (averages[11] || 0) + (averages[12] || 0)) / 3,
      10,
    );

    const metrics = {
      energy,
      speed,
      pitch,
      fluency,
      articulation,
    };

    return {
      ...baseResult,
      acoustic: {
        mfcc: mfccData,
        metrics,
      },
      metrics,
    };
  }

  async findByStudent(
    studentId: string,
  ): Promise<MotivationAnalysisResponse[]> {
    const results = await this.prisma.motivationAnalysis.findMany({
      where: { studentId },
      include: {
        student: {
          include: {
            class: true,
            studyProgram: true,
            lecturer: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return results
      .map((item) => this.transformAnalysis(item))
      .filter((item): item is MotivationAnalysisResponse => item !== null);
  }

  async findByClass(classId: string): Promise<MotivationAnalysisResponse[]> {
    const results = await this.prisma.motivationAnalysis.findMany({
      where: {
        student: {
          classId,
        },
      },
      include: {
        student: {
          include: {
            class: true,
            studyProgram: true,
            lecturer: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return results
      .map((item) => this.transformAnalysis(item))
      .filter((item): item is MotivationAnalysisResponse => item !== null);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: MotivationAnalysisResponse[];
    meta: { total: number; page: number; lastPage: number };
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.motivationAnalysis.findMany({
        skip,
        take: limit,
        include: {
          student: {
            include: {
              class: true,
              studyProgram: true,
              lecturer: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.motivationAnalysis.count(),
    ]);

    return {
      data: data
        .map((item) => this.transformAnalysis(item))
        .filter((item): item is MotivationAnalysisResponse => item !== null),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<MotivationAnalysisResponse | null> {
    const analysis = await this.prisma.motivationAnalysis.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            class: true,
            studyProgram: true,
            lecturer: true,
          },
        },
      },
    });
    return this.transformAnalysis(analysis);
  }

  async getStudentGraphData(studentId: string): Promise<StudentGraphData> {
    // 1. Get Student Info
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { classId: true, name: true },
    });

    if (!student || !student.classId) {
      throw new InternalServerErrorException(
        'Data mahasiswa atau kelas tidak ditemukan',
      );
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
    const personalAnalyses = classAnalyses.filter(
      (a) => a.studentId === studentId,
    );
    const latestPersonal =
      personalAnalyses.length > 0
        ? personalAnalyses[personalAnalyses.length - 1]
        : null;
    const prevPersonal =
      personalAnalyses.length > 1
        ? personalAnalyses[personalAnalyses.length - 2]
        : null;

    // 4. Calculate Weekly Trend (Class Average)
    const weeklyDataMap = new Map<string, { total: number; count: number }>();
    for (const a of classAnalyses) {
      const date = new Date(a.createdAt);
      // Get week number or just use YYYY-WW format
      const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      const current = weeklyDataMap.get(weekKey) || { total: 0, count: 0 };
      weeklyDataMap.set(weekKey, {
        total: current.total + a.confidence * 100,
        count: current.count + 1,
      });
    }

    const weeklyTrend = Array.from(weeklyDataMap.entries()).map(
      ([label, val]) => ({
        label,
        value: Math.round(val.total / val.count),
      }),
    );

    // 5. Calculate Benchmarking (Latest Personal vs Class Average)
    const transformedClass = classAnalyses
      .map((a) => this.transformAnalysis(a))
      .filter(
        (analysisItem): analysisItem is MotivationAnalysisResponse =>
          analysisItem !== null,
      );
    const transformedPersonal = latestPersonal
      ? this.transformAnalysis(latestPersonal)
      : null;

    const classAvgMetrics = {
      energy: 0,
      speed: 0,
      pitch: 0,
      fluency: 0,
      articulation: 0,
    };

    for (const a of transformedClass) {
      classAvgMetrics.energy += a.metrics.energy;
      classAvgMetrics.speed += a.metrics.speed;
      classAvgMetrics.pitch += a.metrics.pitch;
      classAvgMetrics.fluency += a.metrics.fluency;
      classAvgMetrics.articulation += a.metrics.articulation;
    }

    const numClass = transformedClass.length || 1;
    const benchmark = [
      {
        subject: 'Motivasi Diri',
        A: transformedPersonal?.metrics.energy || 0,
        B: Math.round(classAvgMetrics.energy / numClass),
      },
      {
        subject: 'Tujuan Belajar',
        A: transformedPersonal?.metrics.speed || 0,
        B: Math.round(classAvgMetrics.speed / numClass),
      },
      {
        subject: 'Percaya Diri',
        A: transformedPersonal?.metrics.pitch || 0,
        B: Math.round(classAvgMetrics.pitch / numClass),
      },
      {
        subject: 'Konsistensi',
        A: transformedPersonal?.metrics.fluency || 0,
        B: Math.round(classAvgMetrics.fluency / numClass),
      },
      {
        subject: 'Kejelasan',
        A: transformedPersonal?.metrics.articulation || 0,
        B: Math.round(classAvgMetrics.articulation / numClass),
      },
    ];

    // 6. Personal Stats (Latest, Activity, Avg, Growth)
    const avgPersonalScore =
      personalAnalyses.length > 0
        ? Math.round(
            personalAnalyses.reduce(
              (acc, curr) => acc + curr.confidence * 100,
              0,
            ) / personalAnalyses.length,
          )
        : 0;

    const growth =
      latestPersonal && prevPersonal
        ? Math.round(
            ((latestPersonal.confidence - prevPersonal.confidence) /
              prevPersonal.confidence) *
              100,
          )
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
