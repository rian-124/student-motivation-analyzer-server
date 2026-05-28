import 'reflect-metadata';

import { DatabaseModule } from '../src/database/database.module';
import { UserSeeder } from '../src/seeder/user.seeder';
import { seeder } from 'nestjs-seeder';
import { AcademicSeeder } from '../src/seeder/academic.seeder';

seeder({
  imports: [DatabaseModule],
}).run([UserSeeder, AcademicSeeder]);
