import { Injectable } from '@nestjs/common';
import { Seeder } from 'nestjs-seeder';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AnalysisResultSeeder implements Seeder {
  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<void> {
    const password = await bcrypt.hash('password123', 10);

    const studyPrograms = await this.prisma.studyProgram.findMany({
      include: {
        classes: true,
      },
    });

    // =========================
    // RANDOM NAMA INDONESIA
    // =========================
    const firstNames = [
      'Ahmad',
      'Budi',
      'Citra',
      'Dewi',
      'Eka',
      'Fajar',
      'Galih',
      'Hendra',
      'Indah',
      'Joko',
      'Kartika',
      'Lukman',
      'Maya',
      'Nanda',
      'Putri',
      'Rizky',
      'Siti',
      'Taufik',
      'Wulan',
      'Yusuf',
      'Zahra',
      'Aulia',
      'Bagas',
      'Dian',
      'Farhan',
      'Gita',
      'Hafiz',
      'Intan',
      'Kevin',
      'Lestari',
    ];

    const lastNames = [
      'Saputra',
      'Pratama',
      'Wijaya',
      'Permata',
      'Susanto',
      'Ramadhan',
      'Nugroho',
      'Kusuma',
      'Utami',
      'Maulana',
      'Hidayat',
      'Anggraini',
      'Firmansyah',
      'Purnama',
      'Setiawan',
      'Wibowo',
      'Safitri',
      'Kurniawan',
      'Anjani',
      'Rahmawati',
      'Gunawan',
      'Iskandar',
      'Santoso',
      'Hakim',
      'Siregar',
      'Syahputra',
      'Fadillah',
      'Putri',
      'Mahendra',
      'Azzahra',
    ];

    function getRandomName(): string {
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];

      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      return `${firstName} ${lastName}`;
    }

    // =========================
    // LABEL MOTIVASI
    // =========================
    const predictions = [
      {
        label: 'Sangat Rendah',
        value: 1,
        confidence: 0.91,
      },
      {
        label: 'Rendah',
        value: 2,
        confidence: 0.78,
      },
      {
        label: 'Cukup',
        value: 3,
        confidence: 0.83,
      },
      {
        label: 'Tinggi',
        value: 4,
        confidence: 0.89,
      },
      {
        label: 'Sangat Tinggi',
        value: 5,
        confidence: 0.97,
      },
    ];

    // =========================
    // DUMMY TRANSCRIPTION
    // =========================
    const dummyTranscriptions = [
      'Saya merasa semangat belajar hari ini dan ingin mendapatkan nilai terbaik.',
      'Saya cukup termotivasi mengikuti perkuliahan semester ini.',
      'Kadang saya merasa lelah tetapi tetap ingin menyelesaikan tugas.',
      'Saya merasa percaya diri dengan kemampuan saya saat ini.',
      'Motivasi saya sedikit menurun karena banyak tugas.',
      'Saya ingin meningkatkan prestasi akademik saya.',
      'Belajar kelompok membantu saya lebih termotivasi.',
      'Saya merasa kurang fokus selama perkuliahan online.',
      'Saya tetap berusaha walaupun merasa kesulitan.',
      'Saya sangat antusias mengikuti praktikum minggu ini.',
    ];

    // =========================
    // TOTAL ANALYSIS GLOBAL
    // =========================
    let totalAnalysisCreated = 0;
    const MAX_ANALYSIS = 200;

    for (const program of studyPrograms) {
      // =========================
      // CREATE LECTURER USER
      // =========================
      const lecturerEmail = `dosen.${program.code.toLowerCase()}@kampus.ac.id`;

      const lecturerName = getRandomName();

      const lecturerUser = await this.prisma.user.upsert({
        where: {
          email: lecturerEmail,
        },
        update: {},
        create: {
          email: lecturerEmail,
          password,
          name: lecturerName,
          role: 'lecturer',
        },
      });

      // =========================
      // CREATE LECTURER
      // =========================
      const lecturer = await this.prisma.lecturer.upsert({
        where: {
          userId: lecturerUser.id,
        },
        update: {},
        create: {
          nip: `NIP-${program.code}`,
          name: lecturerName,
          department: program.name,
          userId: lecturerUser.id,
          studyProgramId: program.id,
        },
      });

      // =========================
      // CREATE STUDENTS PER CLASS
      // =========================
      let studentCounter = 1;

      for (const currentClass of program.classes) {
        // Random 20 - 30 mahasiswa
        const totalStudents = Math.floor(Math.random() * (30 - 20 + 1)) + 20;

        for (let i = 1; i <= totalStudents; i++) {
          const randomName = getRandomName();

          const email = `mhs${studentCounter}.${program.code.toLowerCase()}@student.ac.id`;

          const studentUser = await this.prisma.user.upsert({
            where: {
              email,
            },
            update: {},
            create: {
              email,
              password,
              name: randomName,
              role: 'student',
            },
          });

          const student = await this.prisma.student.upsert({
            where: {
              userId: studentUser.id,
            },
            update: {},
            create: {
              nim: `${program.code}2026${studentCounter}`,
              name: randomName,
              semester: `${Math.floor(Math.random() * 8) + 1}`,
              userId: studentUser.id,
              classId: currentClass.id,
              studyProgramId: program.id,
              lecturerId: lecturer.id,
            },
          });

          // =========================
          // CREATE ANALYSIS RESULTS
          // =========================
          if (totalAnalysisCreated < MAX_ANALYSIS) {
            // random 1 - 5 analysis per mahasiswa
            const totalStudentAnalysis = Math.floor(Math.random() * 5) + 1;

            for (let j = 1; j <= totalStudentAnalysis; j++) {
              if (totalAnalysisCreated >= MAX_ANALYSIS) {
                break;
              }

              const randomPrediction =
                predictions[Math.floor(Math.random() * predictions.length)];

              const randomTranscription =
                dummyTranscriptions[
                  Math.floor(Math.random() * dummyTranscriptions.length)
                ];

              await this.prisma.motivationAnalysis.create({
                data: {
                  studentId: student.id,

                  description: `Analisis motivasi ke-${j}`,

                  transcription: randomTranscription,

                  prediction: randomPrediction.label,

                  confidence: randomPrediction.confidence,

                  probabilities: {
                    score: randomPrediction.value,
                    label: randomPrediction.label,
                    motivated: Number(Math.random().toFixed(2)),
                    neutral: Number(Math.random().toFixed(2)),
                    unmotivated: Number(Math.random().toFixed(2)),
                  },

                  mfcc: [
                    Number((Math.random() * 20).toFixed(2)),
                    Number((Math.random() * 20).toFixed(2)),
                    Number((Math.random() * 20).toFixed(2)),
                    Number((Math.random() * 20).toFixed(2)),
                    Number((Math.random() * 20).toFixed(2)),
                    Number((Math.random() * 20).toFixed(2)),
                    Number((Math.random() * 20).toFixed(2)),
                    Number((Math.random() * 20).toFixed(2)),
                    Number((Math.random() * 20).toFixed(2)),
                    Number((Math.random() * 20).toFixed(2)),
                  ],
                },
              });

              totalAnalysisCreated++;
            }
          }

          studentCounter++;
        }
      }
    }

    console.log('AnalysisResultSeeder completed');
  }

  async drop(): Promise<void> {
    await this.prisma.motivationAnalysis.deleteMany();

    await this.prisma.student.deleteMany();

    await this.prisma.lecturer.deleteMany();

    await this.prisma.user.deleteMany();

    console.log('AnalysisResultSeeder dropped');
  }
}
