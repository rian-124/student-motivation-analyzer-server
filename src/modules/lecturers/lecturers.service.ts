import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { LecturerResponse } from './types';

type LecturerMapperInput = {
  userId: string;
  user?: {
    email: string;
    role: string;
  } | null;
  classAssignments: Array<{
    classId: string;
    class?: {
      name: string;
    } | null;
  }>;
} & Record<string, unknown>;

@Injectable()
export class LecturersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLecturerDto: CreateLecturerDto) {
    const { email, password, nip, name, classIds, studyProgramId } =
      createLecturerDto;

    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) throw new ConflictException('Email sudah terdaftar');

    const existingNip = await this.prisma.lecturer.findUnique({
      where: { nip },
    });
    if (existingNip) throw new ConflictException('NIP sudah terdaftar');

    const selectedClasses = classIds?.length
      ? await this.prisma.class.findMany({
          where: { id: { in: classIds } },
          include: { studyProgram: { include: { department: true } } },
        })
      : [];

    const department =
      selectedClasses[0]?.studyProgram?.department?.name ?? null;
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: Role.lecturer,
        },
      });

      const lecturer = await tx.lecturer.create({
        data: {
          nip,
          name,
          department,
          studyProgramId,
          userId: user.id,
        },
        include: {
          user: { select: { email: true, role: true } },
          studyProgram: true,
          classAssignments: {
            include: { class: { select: { id: true, name: true } } },
          },
        },
      });

      if (classIds?.length) {
        await tx.lecturerClassAssignment.createMany({
          data: classIds.map((classId) => ({
            lecturerId: lecturer.id,
            classId,
          })),
          skipDuplicates: true,
        });

        await tx.student.updateMany({
          where: { classId: { in: classIds } },
          data: { lecturerId: lecturer.id },
        });
      }

      return this.mapLecturer(lecturer);
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.lecturer.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { email: true, role: true } },
          studyProgram: true,
          classAssignments: {
            include: { class: { select: { id: true, name: true } } },
          },
          _count: { select: { students: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lecturer.count(),
    ]);

    return {
      data: data.map((lecturer) => this.mapLecturer(lecturer)),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const lecturer = await this.prisma.lecturer.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, role: true } },
        studyProgram: true,
        students: { select: { classId: true } },
        classAssignments: {
          include: { class: { select: { id: true, name: true } } },
        },
      },
    });

    if (!lecturer) throw new NotFoundException('Dosen tidak ditemukan');
    return this.mapLecturer(lecturer);
  }

  async update(id: string, updateLecturerDto: UpdateLecturerDto) {
    const existingLecturer = await this.findOne(id);
    const { email } = updateLecturerDto;

    if (email && email !== existingLecturer.user?.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) throw new ConflictException('Email sudah terdaftar');
    }

    const classIds = updateLecturerDto.classIds;
    const selectedClasses = classIds?.length
      ? await this.prisma.class.findMany({
          where: { id: { in: classIds } },
          include: { studyProgram: { include: { department: true } } },
        })
      : [];

    const department = classIds
      ? (selectedClasses[0]?.studyProgram?.department?.name ?? null)
      : undefined;

    return this.prisma.$transaction(async (tx) => {
      if (updateLecturerDto.password) {
        const hashedPassword = await bcrypt.hash(
          updateLecturerDto.password,
          10,
        );
        await tx.user.update({
          where: { id: existingLecturer.userId },
          data: { password: hashedPassword },
        });
      }

      if (email) {
        await tx.user.update({
          where: { id: existingLecturer.userId },
          data: { email },
        });
      }

      const lecturer = await tx.lecturer.update({
        where: { id },
        data: {
          nip: updateLecturerDto.nip,
          name: updateLecturerDto.name,
          department,
          studyProgramId: updateLecturerDto.studyProgramId,
        },
        include: {
          user: { select: { email: true, role: true } },
          studyProgram: true,
          classAssignments: {
            include: { class: { select: { id: true, name: true } } },
          },
        },
      });

      if (classIds) {
        await tx.lecturerClassAssignment.deleteMany({
          where: { lecturerId: id },
        });

        if (classIds.length > 0) {
          await tx.lecturerClassAssignment.createMany({
            data: classIds.map((classId) => ({ lecturerId: id, classId })),
            skipDuplicates: true,
          });
        }

        await tx.student.updateMany({
          where: { lecturerId: id },
          data: { lecturerId: null },
        });

        if (classIds.length > 0) {
          await tx.student.updateMany({
            where: { classId: { in: classIds } },
            data: { lecturerId: id },
          });
        }
      }

      return this.mapLecturer(lecturer);
    });
  }

  async remove(id: string) {
    const lecturer = await this.findOne(id);
    await this.prisma.user.delete({ where: { id: lecturer.userId } });
    return { message: 'Dosen dan akun berhasil dihapus' };
  }

  private mapLecturer(lecturer: LecturerMapperInput): LecturerResponse {
    return {
      ...lecturer,
      supervisedClassIds:
        lecturer.classAssignments?.map((assignment) => assignment.classId) ??
        [],
      supervisedClasses:
        lecturer.classAssignments
          ?.map((assignment) => assignment.class?.name)
          .filter((name): name is string => Boolean(name)) ?? [],
    };
  }
}
