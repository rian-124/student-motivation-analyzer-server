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

    const [totalStudents, veryLowMotivation, lowMotivation, averageMotivation, highMotivation, veryHighMotivation, totalClasses, totalAnalyses] = await Promise.all([
      this.prisma.student.count({ where: studentWhere }),
      this.prisma.motivationAnalysis.count({ 
        where: { 
          ...analysisWhere,
          prediction: 'Sangat Rendah' 
        } 
      }),
      this.prisma.motivationAnalysis.count({ 
        where: { 
          ...analysisWhere,
          prediction: 'Rendah' 
        } 
      }),
      this.prisma.motivationAnalysis.count({ 
        where: { 
          ...analysisWhere,
          prediction: 'Cukup' 
        } 
      }),
      this.prisma.motivationAnalysis.count({ 
        where: { 
          ...analysisWhere,
          prediction: 'Tinggi' 
        } 
      }),
      this.prisma.motivationAnalysis.count({ 
        where: { 
          ...analysisWhere,
          prediction: 'Sangat Tinggi' 
        } 
      }),
      isAdmin ? this.prisma.class.count() : null,
      this.prisma.motivationAnalysis.count({ where: analysisWhere }),
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
      veryLowMotivation,
      lowMotivation,
      averageMotivation,
      highMotivation,
      veryHighMotivation,
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

      barChart = departments.map((department) => {
        const analyses = department.programs
          .flatMap((program) => program.classes)
          .flatMap((classItem) => classItem.students)
          .flatMap((student) => student.analyses);
        const avg = analyses.length > 0 
          ? analyses.reduce((acc, curr) => acc + curr.confidence, 0) / analyses.length
          : 0;
        return {
          label: department.name,
          value: Math.round(avg * 100),
        };
      }).sort((a, b) => b.value - a.value);
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
