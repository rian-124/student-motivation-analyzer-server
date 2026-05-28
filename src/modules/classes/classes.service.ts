import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.class.findMany({
      include: {
        studyProgram: {
          include: {
            department: true,
          },
        },
        students: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            students: true,
            lecturerAssignments: true,
          },
        },
      },
    });

    const studentIds = data.flatMap((classItem) =>
      classItem.students.map((student) => student.id),
    );

    const analyses = studentIds.length
      ? await this.prisma.motivationAnalysis.findMany({
          where: {
            studentId: { in: studentIds },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      : [];

    const latestByStudent = new Map<string, (typeof analyses)[number]>();
    analyses.forEach((analysis) => {
      if (!latestByStudent.has(analysis.studentId)) {
        latestByStudent.set(analysis.studentId, analysis);
      }
    });

    const rankedData = data
      .map((classItem) => {
        const scores = classItem.students.map((student) => {
          const latest = latestByStudent.get(student.id);
          return latest ? Math.round(latest.confidence * 100) : 0;
        });
        const averageScore =
          scores.length > 0
            ? Math.round(
                scores.reduce((sum, score) => sum + score, 0) / scores.length,
              )
            : 0;

        return {
          ...classItem,
          averageScore,
        };
      })
      .sort(
        (a, b) =>
          b.averageScore - a.averageScore || a.name.localeCompare(b.name),
      )
      .map((classItem, index) => ({
        ...classItem,
        rank: index + 1,
      }));

    return {
      data: rankedData,
      meta: {
        total: rankedData.length,
        page: 1,
        limit: rankedData.length,
      },
    };
  }

  async findOne(id: string) {
    const classRecord = await this.prisma.class.findUnique({
      where: { id },
      include: {
        studyProgram: {
          include: {
            department: true,
          },
        },
        students: {
          orderBy: {
            name: 'asc',
          },
        },
        lecturerAssignments: {
          include: {
            lecturer: {
              include: {
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!classRecord) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    return classRecord;
  }

  async getStudentsByClassId(id: string) {
    const classRecord = await this.findOne(id);

    return {
      data: classRecord.students,
      meta: {
        total: classRecord.students.length,
        page: 1,
        limit: classRecord.students.length,
      },
    };
  }

  async getLeaderboard(id: string) {
    const classRecord = await this.prisma.class.findUnique({
      where: { id },
      include: {
        studyProgram: true,
        students: true,
      },
    });

    if (!classRecord) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    const studentIds = classRecord.students.map((student) => student.id);

    const analyses = await this.prisma.motivationAnalysis.findMany({
      where: {
        studentId: {
          in: studentIds,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const latestByStudent = new Map<string, (typeof analyses)[number]>();
    analyses.forEach((analysis) => {
      if (!latestByStudent.has(analysis.studentId)) {
        latestByStudent.set(analysis.studentId, analysis);
      }
    });

    const students = classRecord.students
      .map((student) => {
        const latestAnalysis = latestByStudent.get(student.id);
        const score = latestAnalysis
          ? Math.round(latestAnalysis.confidence * 100)
          : 0;

        const status = this.normalizeStatus(
          latestAnalysis?.prediction,
          latestAnalysis?.confidence ?? 0,
        );

        return {
          studentId: student.id,
          name: student.name,
          nim: student.nim,
          score,
          status,
        };
      })
      .sort((a, b) => b.score - a.score);

    const rankedStudents = students.map((student, index) => ({
      ...student,
      rank: index + 1,
    }));

    const highCount = rankedStudents.filter(
      (student) => student.status === 'HIGH',
    ).length;
    const mediumCount = rankedStudents.filter(
      (student) => student.status === 'MEDIUM',
    ).length;
    const lowCount = rankedStudents.filter(
      (student) => student.status === 'LOW',
    ).length;

    const averageScore =
      rankedStudents.length > 0
        ? Math.round(
            rankedStudents.reduce((sum, student) => sum + student.score, 0) /
              rankedStudents.length,
          )
        : 0;

    return {
      classId: classRecord.id,
      className: classRecord.name,
      programId: classRecord.studyProgramId,
      programName: classRecord.studyProgram?.name ?? null,
      averageScore,
      totalStudents: rankedStudents.length,
      highCount,
      mediumCount,
      lowCount,
      students: rankedStudents,
    };
  }

  async findOrCreate(name: string, studyProgramId?: string | null) {
    const existing = await this.prisma.class.findUnique({ where: { name } });
    if (existing) {
      return existing;
    }

    return this.prisma.class.create({
      data: {
        name,
        studyProgramId: studyProgramId ?? null,
      },
    });
  }

  private normalizeStatus(prediction?: string | null, confidence = 0) {
    const normalizedPrediction = (prediction ?? '').toLowerCase();

    if (
      normalizedPrediction.includes('high') ||
      normalizedPrediction.includes('tinggi') ||
      normalizedPrediction.includes('positif')
    ) {
      return 'HIGH';
    }

    if (
      normalizedPrediction.includes('medium') ||
      normalizedPrediction.includes('sedang') ||
      normalizedPrediction.includes('cukup')
    ) {
      return 'MEDIUM';
    }

    if (
      normalizedPrediction.includes('low') ||
      normalizedPrediction.includes('rendah') ||
      normalizedPrediction.includes('amotivasi') ||
      normalizedPrediction.includes('negatif')
    ) {
      return 'LOW';
    }

    if (confidence >= 0.7) {
      return 'HIGH';
    }

    if (confidence >= 0.4) {
      return 'MEDIUM';
    }

    return 'LOW';
  }
}
