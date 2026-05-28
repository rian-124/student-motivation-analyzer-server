import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  private readonly motivationLabels: Record<string, string> = {
    '1': 'Sangat Rendah',
    '2': 'Rendah',
    '3': 'Cukup',
    '4': 'Tinggi',
    '5': 'Sangat Tinggi',
  };

  private readonly predictionCodes = {
    veryLow: '1',
    low: '2',
    average: '3',
    high: '4',
    veryHigh: '5',
  };

  constructor(private prisma: PrismaService) {}

  async getStats(userId: string, role: Role) {
    const isAdmin = role === Role.admin;
    const isLecturer = role === Role.lecturer;

    let lecturerId: string | undefined;
    if (isLecturer) {
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { userId },
      });
      lecturerId = lecturer?.id;
    }

    const studentWhere = isLecturer ? { lecturerId } : {};
    const analysisWhere = isLecturer ? { student: { lecturerId } } : {};

    const [
      totalStudents,
      veryLowMotivation,
      lowMotivation,
      averageMotivation,
      highMotivation,
      veryHighMotivation,
      totalClasses,
      totalAnalyses,
    ] = await Promise.all([
      this.prisma.student.count({ where: studentWhere }),
      this.prisma.motivationAnalysis.count({
        where: {
          ...analysisWhere,
          prediction: this.predictionCodes.veryLow,
        },
      }),
      this.prisma.motivationAnalysis.count({
        where: {
          ...analysisWhere,
          prediction: this.predictionCodes.low,
        },
      }),
      this.prisma.motivationAnalysis.count({
        where: {
          ...analysisWhere,
          prediction: this.predictionCodes.average,
        },
      }),
      this.prisma.motivationAnalysis.count({
        where: {
          ...analysisWhere,
          prediction: this.predictionCodes.high,
        },
      }),
      this.prisma.motivationAnalysis.count({
        where: {
          ...analysisWhere,
          prediction: this.predictionCodes.veryHigh,
        },
      }),
      isAdmin ? this.prisma.class.count() : null,
      this.prisma.motivationAnalysis.count({ where: analysisWhere }),
    ]);

    // Calculate class average
    let classAverage = 0;
    if (totalAnalyses > 0) {
      const result = await this.prisma.motivationAnalysis.aggregate({
        where: analysisWhere,
        _avg: { confidence: true },
      });
      classAverage = Math.round((result._avg.confidence || 0) * 100);
    }

    return {
      totalStudents,
      veryLowMotivation,
      lowMotivation,
      averageMotivation,
      highMotivation,
      veryHighMotivation,
      totalClasses: isAdmin ? totalClasses : undefined,
      classAverage: !isAdmin ? classAverage : undefined,
    };
  }

  async getPublicProgramStats() {
    const analyses = await this.prisma.motivationAnalysis.findMany({
      select: {
        confidence: true,
        weightedScore: true,
        studentId: true,
        student: {
          select: {
            studyProgram: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const programGroups: Record<
      string,
      {
        programName: string;
        scores: number[];
        weightedScores: number[];
        studentIds: Set<string>;
      }
    > = {};

    for (const a of analyses) {
      const program = a.student?.studyProgram;
      if (!program) continue;
      if (!programGroups[program.id]) {
        programGroups[program.id] = {
          programName: program.name,
          scores: [],
          weightedScores: [],
          studentIds: new Set(),
        };
      }
      programGroups[program.id].scores.push(a.confidence);
      if (a.weightedScore != null) {
        programGroups[program.id].weightedScores.push(a.weightedScore);
      }
      programGroups[program.id].studentIds.add(a.studentId);
    }

    return Object.values(programGroups)
      .map(({ programName, scores, weightedScores, studentIds }) => ({
        programName,
        avgScore:
          weightedScores.length > 0
            ? Math.round(
                weightedScores.reduce((a, b) => a + b, 0) /
                  weightedScores.length,
              )
            : scores.length > 0
              ? Math.round(
                  (scores.reduce((a, b) => a + b, 0) / scores.length) * 100,
                )
              : 0,
        totalStudents: studentIds.size,
        totalAnalyses: scores.length,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }

  async getCharts(userId: string, role: Role) {
    const isAdmin = role === Role.admin;
    const isLecturer = role === Role.lecturer;

    let lecturerId: string | undefined;
    if (isLecturer) {
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { userId },
      });
      lecturerId = lecturer?.id;
    }

    const analysisWhere = isLecturer ? { student: { lecturerId } } : {};

    // Pie Chart Data
    const distribution = await this.prisma.motivationAnalysis.groupBy({
      by: ['prediction'],
      where: analysisWhere,
      _count: true,
    });

    const pieChart = distribution.map((d) => ({
      name: this.motivationLabels[d.prediction] || d.prediction,
      value: d._count,
    }));

    // Bar Chart Data
    let barChart: { label: string; value: number }[] = [];
    if (isAdmin) {
      const departments = await this.prisma.department.findMany({
        include: {
          programs: {
            include: {
              classes: {
                include: {
                  students: {
                    include: {
                      analyses: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      barChart = departments
        .map((department) => {
          const analyses = department.programs
            .flatMap((program) => program.classes)
            .flatMap((classItem) => classItem.students)
            .flatMap((student) => student.analyses);
          const avg =
            analyses.length > 0
              ? analyses.reduce((acc, curr) => acc + curr.confidence, 0) /
                analyses.length
              : 0;
          return {
            label: department.name,
            value: Math.round(avg * 100),
          };
        })
        .sort((a, b) => b.value - a.value);
    } else {
      const analyses = await this.prisma.motivationAnalysis.findMany({
        where: analysisWhere,
        select: {
          confidence: true,
          student: { select: { class: { select: { name: true } } } },
        },
      });

      const classGroups: Record<string, number[]> = {};
      for (const a of analyses) {
        const className = a.student?.class?.name || 'Tanpa Kelas';
        if (!classGroups[className]) classGroups[className] = [];
        classGroups[className].push(a.confidence);
      }

      barChart = Object.keys(classGroups)
        .map((className) => ({
          label: className,
          value: Math.round(
            (classGroups[className].reduce((a, b) => a + b, 0) /
              classGroups[className].length) *
              100,
          ),
        }))
        .sort((a, b) => b.value - a.value);
    }

    return {
      pieChart,
      barChart,
    };
  }
}
