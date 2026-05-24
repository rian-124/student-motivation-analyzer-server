import 'reflect-metadata';

import { DatabaseModule } from '../src/database/database.module';
import { UserSeeder } from '../src/seeder/user.seeder';
import { seeder } from 'nestjs-seeder';

seeder({
  imports: [DatabaseModule],
}).run([UserSeeder]);
