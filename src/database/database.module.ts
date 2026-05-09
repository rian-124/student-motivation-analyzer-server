import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // ← Global agar PrismaService bisa dipakai di semua module tanpa import ulang
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
