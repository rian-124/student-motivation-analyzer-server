import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.class.findMany({
      include: {
        _count: {
          select: { students: true, lecturers: true }
        }
      }
    });
  }

  async findOrCreate(name: string) {
    const existing = await this.prisma.class.findUnique({ where: { name } });
    if (existing) return existing;

    return this.prisma.class.create({ data: { name } });
  }
}
