import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class LecturersService {
  constructor(private prisma: PrismaService) {}

  async create(createLecturerDto: CreateLecturerDto) {
    const { email, password, nip, name, department, class: className } = createLecturerDto;

    const existingEmail = await this.prisma.user.findUnique({ where: { email } });
    if (existingEmail) throw new ConflictException('Email sudah terdaftar');

    const existingNip = await this.prisma.lecturer.findUnique({ where: { nip } });
    if (existingNip) throw new ConflictException('NIP sudah terdaftar');

    let classId: string | null = null;
    if (className) {
      const classRecord = await this.prisma.class.upsert({
        where: { name: className },
        update: {},
        create: { name: className },
      });
      classId = classRecord.id;
    }

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
          classId,
          userId: user.id,
        },
        include: {
          user: {
            select: { email: true, role: true },
          },
          class: true,
        },
      });

      return lecturer;
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
          class: true,
          _count: {
            select: { students: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lecturer.count(),
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
    const lecturer = await this.prisma.lecturer.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, role: true } },
        class: true,
        students: true,
      },
    });

    if (!lecturer) throw new NotFoundException('Dosen tidak ditemukan');
    return lecturer;
  }

  async update(id: string, updateLecturerDto: UpdateLecturerDto) {
    await this.findOne(id);

    let classId: string | undefined = undefined;
    if (updateLecturerDto.class) {
      const classRecord = await this.prisma.class.upsert({
        where: { name: updateLecturerDto.class },
        update: {},
        create: { name: updateLecturerDto.class },
      });
      classId = classRecord.id;
    }

    return this.prisma.lecturer.update({
      where: { id },
      data: {
        nip: updateLecturerDto.nip,
        name: updateLecturerDto.name,
        department: updateLecturerDto.department,
        classId,
      },
      include: {
        user: { select: { email: true, role: true } },
        class: true,
      },
    });
  }

  async remove(id: string) {
    const lecturer = await this.findOne(id);
    await this.prisma.user.delete({ where: { id: lecturer.userId } });
    return { message: 'Dosen dan akun berhasil dihapus' };
  }
}
