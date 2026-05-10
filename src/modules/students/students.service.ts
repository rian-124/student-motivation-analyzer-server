import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(createStudentDto: CreateStudentDto) {
    const { email, password, nim, name, class: className, semester, lecturerId } = createStudentDto;

    const existingEmail = await this.prisma.user.findUnique({ where: { email } });
    if (existingEmail) throw new ConflictException('Email sudah terdaftar');

    const existingNim = await this.prisma.student.findUnique({ where: { nim } });
    if (existingNim) throw new ConflictException('NIM sudah terdaftar');

    let finalClassId: string | null = null;
    
    // Auto-assign class from lecturer if lecturerId is provided
    if (lecturerId) {
      const lecturer = await this.prisma.lecturer.findUnique({ 
        where: { id: lecturerId },
        include: { class: true }
      });
      if (lecturer && lecturer.classId) {
        finalClassId = lecturer.classId;
      }
    }

    // If still no classId but className is provided, find/create it
    if (!finalClassId && className) {
      const classRecord = await this.prisma.class.upsert({
        where: { name: className },
        update: {},
        create: { name: className },
      });
      finalClassId = classRecord.id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: Role.student,
        },
      });

      const student = await tx.student.create({
        data: {
          nim,
          name,
          semester,
          userId: user.id,
          lecturerId,
          classId: finalClassId,
        },
        include: {
          user: { select: { email: true, role: true } },
          class: true,
          lecturer: { 
            include: { class: true } 
          },
        },
      });

      return student;
    });
  }

  async findAll(page: number = 1, limit: number = 10, lecturerId?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (lecturerId) where.lecturerId = lecturerId;

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { email: true, role: true } },
          class: true,
          lecturer: { 
            include: { class: true } 
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count({ where }),
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
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, role: true } },
        class: true,
        lecturer: true,
      },
    });

    if (!student) throw new NotFoundException('Mahasiswa tidak ditemukan');
    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const student = await this.findOne(id);
    const { lecturerId, class: className } = updateStudentDto;

    let finalClassId: string | null = student.classId;

    // Auto-assign class from lecturer if lecturerId is changed
    if (lecturerId && lecturerId !== student.lecturerId) {
      const lecturer = await this.prisma.lecturer.findUnique({ 
        where: { id: lecturerId },
        include: { class: true }
      });
      if (lecturer && lecturer.classId) {
        finalClassId = lecturer.classId;
      }
    } else if (className) {
      // Manual class change
      const classRecord = await this.prisma.class.upsert({
        where: { name: className },
        update: {},
        create: { name: className },
      });
      finalClassId = classRecord.id;
    }

    return this.prisma.student.update({
      where: { id },
      data: {
        nim: updateStudentDto.nim,
        name: updateStudentDto.name,
        semester: updateStudentDto.semester,
        lecturerId: updateStudentDto.lecturerId,
        classId: finalClassId,
      },
      include: {
        user: { select: { email: true, role: true } },
        class: true,
        lecturer: { 
          include: { class: true } 
        },
      },
    });
  }

  async remove(id: string) {
    const student = await this.findOne(id);
    await this.prisma.user.delete({ where: { id: student.userId } });
    return { message: 'Mahasiswa dan akun berhasil dihapus' };
  }
}
