import 'reflect-metadata';
import { seeder } from 'nestjs-seeder';
import { DatabaseModule } from '../src/database/database.module';
import { UserSeeder } from '../src/seeder/user.seeder';

seeder({
  imports: [DatabaseModule],
}).run([UserSeeder]);
