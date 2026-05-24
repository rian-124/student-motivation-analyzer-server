import { Injectable } from '@nestjs/common';
import { Seeder } from 'nestjs-seeder';
import * as bcrypt from 'bcrypt';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

const adminUser = {
  email: 'admin@example.com',
  password: 'admin123456',
  name: 'Administrator',
};

@Injectable()
export class UserSeeder implements Seeder {
  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<User> {
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);

    return this.prisma.user.upsert({
      where: { email: adminUser.email },
      update: {
        name: adminUser.name,
        password: hashedPassword,
        role: Role.admin,
      },
      create: {
        email: adminUser.email,
        name: adminUser.name,
        password: hashedPassword,
        role: Role.admin,
      },
    });
  }

  async drop(): Promise<Prisma.BatchPayload> {
    return this.prisma.user.deleteMany({
      where: { role: Role.admin },
    });
  }
}
