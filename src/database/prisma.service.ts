import 'dotenv/config';
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Database terhubung');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database terputus');
  }

  /**
   * Digunakan saat testing untuk membersihkan database
   * Hanya bisa dipanggil di environment 'test'
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('cleanDatabase hanya boleh dipanggil saat testing!');
    }
    // Hapus semua data dalam urutan yang benar (ikuti foreign key)
    await this.student.deleteMany();
    await this.lecturer.deleteMany();
    await this.class.deleteMany();
    await this.user.deleteMany();
  }
}
