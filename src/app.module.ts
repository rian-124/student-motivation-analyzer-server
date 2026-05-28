import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { appConfig, databaseConfig, jwtConfig } from './config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { LecturersModule } from './modules/lecturers/lecturers.module';
import { MotivationAnalysisModule } from './modules/motivation-analysis/motivation-analysis.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // Global Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),

    // Database
    DatabaseModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    StudentsModule,
    LecturersModule,
    MotivationAnalysisModule,
    AnalyticsModule,
    ClassesModule,
    ProgramsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
