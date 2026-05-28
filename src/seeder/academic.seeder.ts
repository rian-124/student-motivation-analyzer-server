import { Injectable } from '@nestjs/common';
import { Seeder } from 'nestjs-seeder';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AcademicSeeder implements Seeder {
  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<void> {
    // =========================
    // DEPARTMENTS
    // =========================
    const departments = [
      {
        code: 'TI',
        name: 'Teknik Informatika',
      },
      {
        code: 'TM',
        name: 'Teknik Mesin',
      },
      {
        code: 'KESEHATAN',
        name: 'Kesehatan',
      },
    ];

    for (const department of departments) {
      await this.prisma.department.upsert({
        where: { code: department.code },
        update: {},
        create: department,
      });
    }

    // =========================
    // GET DEPARTMENTS
    // =========================
    const tiDepartment = await this.prisma.department.findUnique({
      where: { code: 'TI' },
    });

    const tmDepartment = await this.prisma.department.findUnique({
      where: { code: 'TM' },
    });

    const kesehatanDepartment = await this.prisma.department.findUnique({
      where: { code: 'KESEHATAN' },
    });

    if (!tiDepartment || !tmDepartment || !kesehatanDepartment) {
      throw new Error('Department not found');
    }

    // =========================
    // STUDY PROGRAMS
    // =========================
    const studyPrograms = [
      // ================= TI =================
      {
        code: 'D4RPL',
        name: 'Rekayasa Perangkat Lunak',
        degreeLevel: 'D4',
        departmentId: tiDepartment.id,
      },
      {
        code: 'D3TI',
        name: 'Teknik Informatika',
        degreeLevel: 'D3',
        departmentId: tiDepartment.id,
      },
      {
        code: 'D4SIKC',
        name: 'Sistem Informasi Kota Cerdas',
        degreeLevel: 'D4',
        departmentId: tiDepartment.id,
      },
      {
        code: 'D4TRIK',
        name: 'Teknologi Rekayasa Komputer',
        degreeLevel: 'D4',
        departmentId: tiDepartment.id,
      },

      // ================= TM =================
      {
        code: 'D3TM',
        name: 'Teknik Mesin',
        degreeLevel: 'D3',
        departmentId: tmDepartment.id,
      },
      {
        code: 'D3TPTU',
        name: 'Teknik Pendingin dan Tata Udara',
        degreeLevel: 'D3',
        departmentId: tmDepartment.id,
      },
      {
        code: 'D4PM',
        name: 'Perancangan Manufaktur',
        degreeLevel: 'D4',
        departmentId: tmDepartment.id,
      },
      {
        code: 'D4TRIKON',
        name: 'Teknologi Rekayasa Instrumentasi dan Kontrol',
        degreeLevel: 'D4',
        departmentId: tmDepartment.id,
      },

      // ================= KESEHATAN =================
      {
        code: 'D3KP',
        name: 'Keperawatan',
        degreeLevel: 'D3',
        departmentId: kesehatanDepartment.id,
      },
      {
        code: 'D4TLM',
        name: 'Teknologi Laboratorium Medis',
        degreeLevel: 'D4',
        departmentId: kesehatanDepartment.id,
      },
      {
        code: 'D4TREM',
        name: 'Teknologi Rekayasa Elektro-medis',
        degreeLevel: 'D4',
        departmentId: kesehatanDepartment.id,
      },
    ];

    for (const studyProgram of studyPrograms) {
      await this.prisma.studyProgram.upsert({
        where: { code: studyProgram.code },
        update: {},
        create: studyProgram,
      });
    }

    // =========================
    // CLASSES
    // =========================
    const allStudyPrograms = await this.prisma.studyProgram.findMany();

    const classLetters = ['A', 'B', 'C', 'D'];

    for (const program of allStudyPrograms) {
      const maxLevel = program.degreeLevel === 'D4' ? 4 : 3;

      for (let level = 1; level <= maxLevel; level++) {
        for (const letter of classLetters) {
          const className = `${program.code}-${level}${letter}`;

          await this.prisma.class.upsert({
            where: { name: className },
            update: {},
            create: {
              name: className,
              studyProgramId: program.id,
            },
          });
        }
      }
    }

    console.log('Academic seeder completed');
  }

  async drop(): Promise<void> {
    await this.prisma.class.deleteMany();

    await this.prisma.studyProgram.deleteMany();

    await this.prisma.department.deleteMany();

    console.log('Academic seeder dropped');
  }
}