import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateLecturerClassAccess(
    lecturerId: string,
    classId: string,
  ) {
    const assignment = await this.prisma.lecturerClassAssignment.findFirst({
      where: { lecturerId, classId },
      select: { id: true },
    });

    if (!assignment) {
      throw new BadRequestException(
        'Kelas tidak termasuk perwalian dosen yang dipilih',
      );
    }
  }

  async create(
    createStudentDto: CreateStudentDto,
    currentUser?: { id: string; role: Role },
  ) {
    const {
      email,
      password,
      nim,
      name,
      class: className,
      classId,
      studyProgramId,
      semester,
      lecturerId: providedLecturerId,
    } = createStudentDto;

    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) throw new ConflictException('Email sudah terdaftar');

    const existingNim = await this.prisma.student.findUnique({
      where: { nim },
    });
    if (existingNim) throw new ConflictException('NIM sudah terdaftar');

    let lecturerId = providedLecturerId ?? null;
    let finalClassId: string = classId;
    let finalStudyProgramId = studyProgramId ?? null;

    if (!lecturerId && currentUser?.role === Role.lecturer) {
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { userId: currentUser.id },
      });

      if (lecturer) {
        lecturerId = lecturer.id;
      }
    }

    if (!finalClassId && className) {
      const classRecord = await this.prisma.class.upsert({
        where: { name: className },
        update: {},
        create: { name: className },
      });
      finalClassId = classRecord.id;
    }

    if (!finalClassId) {
      throw new BadRequestException('classId wajib diisi');
    }

    if (lecturerId) {
      await this.validateLecturerClassAccess(lecturerId, finalClassId);
    }

    if (!finalStudyProgramId && finalClassId) {
      const classRecord = await this.prisma.class.findUnique({
        where: { id: finalClassId },
        select: { studyProgramId: true },
      });
      finalStudyProgramId = classRecord?.studyProgramId ?? null;
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
          studyProgramId: finalStudyProgramId,
        },
        include: {
          user: { select: { email: true, role: true } },
          class: true,
          studyProgram: true,
          lecturer: {
            include: { classAssignments: { include: { class: true } } },
          },
        },
      });

      return student;
    });
  }

  async findAll(page: number = 1, limit: number = 10, lecturerId?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.StudentWhereInput = lecturerId ? { lecturerId } : {};

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { email: true, role: true } },
          class: true,
          studyProgram: true,
          lecturer: {
            include: { classAssignments: { include: { class: true } } },
          },
          _count: { select: { analyses: true } },
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
        studyProgram: true,
        lecturer: true,
      },
    });

    if (!student) throw new NotFoundException('Mahasiswa tidak ditemukan');
    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const student = await this.findOne(id);
    const {
      lecturerId,
      class: className,
      classId,
      studyProgramId,
      password,
      nim,
      name,
      semester,
    } = updateStudentDto;

    let finalClassId: string | null = classId ?? student.classId ?? null;
    let finalStudyProgramId = studyProgramId ?? student.studyProgramId ?? null;
    const finalLecturerId = lecturerId ?? student.lecturerId ?? null;

    if (className && !classId) {
      const classRecord = await this.prisma.class.upsert({
        where: { name: className },
        update: {},
        create: { name: className },
      });
      finalClassId = classRecord.id;
    }

    if (finalLecturerId && finalClassId) {
      await this.validateLecturerClassAccess(finalLecturerId, finalClassId);
    }

    if (!finalStudyProgramId && finalClassId) {
      const classRecord = await this.prisma.class.findUnique({
        where: { id: finalClassId },
        select: { studyProgramId: true },
      });
      finalStudyProgramId = classRecord?.studyProgramId ?? null;
    }

    return this.prisma.$transaction(async (tx) => {
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await tx.user.update({
          where: { id: student.userId },
          data: { password: hashedPassword },
        });
      }

      const updatedStudent = await tx.student.update({
        where: { id },
        data: {
          nim: nim ?? student.nim,
          name: name ?? student.name,
          semester: semester ?? student.semester,
          lecturerId: finalLecturerId,
          classId: finalClassId,
          studyProgramId: finalStudyProgramId,
        },
        include: {
          user: { select: { email: true, role: true } },
          class: true,
          studyProgram: true,
          lecturer: {
            include: { classAssignments: { include: { class: true } } },
          },
        },
      });

      return updatedStudent;
    });
  }

  async remove(id: string) {
    const student = await this.findOne(id);
    await this.prisma.user.delete({ where: { id: student.userId } });
    return { message: 'Mahasiswa dan akun berhasil dihapus' };
  }
}
