import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AnalyticsService {
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

    const [totalStudents, totalAnalyses, lowMotivation, totalClasses] = await Promise.all([
      this.prisma.student.count({ where: studentWhere }),
      this.prisma.motivationAnalysis.count({ where: analysisWhere }),
      this.prisma.motivationAnalysis.count({ 
        where: { 
          ...analysisWhere,
          prediction: 'Amotivasi' 
        } 
      }),
      isAdmin ? this.prisma.class.count() : null,
    ]);

    // Calculate class average
    let classAverage = 0;
    if (totalAnalyses > 0) {
      const result = await this.prisma.motivationAnalysis.aggregate({
        where: analysisWhere,
        _avg: { confidence: true }
      });
      classAverage = Math.round((result._avg.confidence || 0) * 100);
    }

    return {
      totalStudents,
      totalAnalyses,
      lowMotivation,
      totalClasses: isAdmin ? totalClasses : undefined,
      classAverage: !isAdmin ? classAverage : undefined,
    };
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

    const pieChart = distribution.map(d => ({
      name: d.prediction,
      value: d._count,
    }));

    // Bar Chart Data
    let barChart: { label: string; value: number }[] = [];
    if (isAdmin) {
      const classes = await this.prisma.class.findMany({
        include: {
          students: {
            include: {
              analyses: true
            }
          }
        }
      });

      barChart = classes.map(c => {
        const analyses = c.students.flatMap(s => s.analyses);
        const avg = analyses.length > 0 
          ? analyses.reduce((acc, curr) => acc + curr.confidence, 0) / analyses.length
          : 0;
        return {
          label: c.name,
          value: Math.round(avg * 100)
        };
      });
    } else {
      const analyses = await this.prisma.motivationAnalysis.findMany({
        where: analysisWhere,
        select: { createdAt: true, confidence: true },
        orderBy: { createdAt: 'asc' }
      });

      const weeks: Record<string, number[]> = {};
      analyses.forEach(a => {
        const week = `M${Math.ceil(a.createdAt.getDate() / 7)}`;
        if (!weeks[week]) weeks[week] = [];
        weeks[week].push(a.confidence);
      });

      barChart = Object.keys(weeks).map(w => ({
        label: w,
        value: Math.round((weeks[w].reduce((a, b) => a + b, 0) / weeks[w].length) * 100)
      })).slice(-8);
    }

    return {
      pieChart,
      barChart,
    };
  }
}
