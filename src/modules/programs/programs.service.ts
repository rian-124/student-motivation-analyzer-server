import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.studyProgram.findMany({
      include: {
        department: true,
        _count: {
          select: {
            classes: true,
            students: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      data,
      meta: {
        total: data.length,
        page: 1,
        limit: data.length,
      },
    };
  }

  async findOne(id: string) {
    const program = await this.prisma.studyProgram.findUnique({
      where: { id },
      include: {
        department: true,
        classes: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            students: true,
            classes: true,
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program studi tidak ditemukan');
    }

    return program;
  }
}
