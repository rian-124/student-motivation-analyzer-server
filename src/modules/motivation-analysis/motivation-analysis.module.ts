import { Module } from '@nestjs/common';
import { MotivationAnalysisController } from './motivation-analysis.controller';
import { MotivationAnalysisService } from './motivation-analysis.service';

@Module({
  imports: [],
  controllers: [MotivationAnalysisController],
  providers: [MotivationAnalysisService],
  exports: [MotivationAnalysisService],
})
export class MotivationAnalysisModule {}
