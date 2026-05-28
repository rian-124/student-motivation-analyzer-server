import 'reflect-metadata';

import { DatabaseModule } from '../src/database/database.module';
import { UserSeeder } from '../src/seeder/user.seeder';
import { seeder } from 'nestjs-seeder';
import { AcademicSeeder } from '../src/seeder/academic.seeder';
import { AnalysisResultSeeder } from '../src/seeder/analysis-result.seeder';

seeder({
  imports: [DatabaseModule],
}).run([UserSeeder, AcademicSeeder, AnalysisResultSeeder]);
