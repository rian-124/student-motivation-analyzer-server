import { Controller, Get, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { WebResponse } from '../../common/dto/web-response.dto';
import { buildWebResponse } from '../../common/helpers';

@ApiTags('Public')
@Controller('analytics/public')
export class PublicAnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('program-stats')
  @ApiOperation({
    summary: 'Ambil rata-rata skor motivasi per program studi (publik)',
  })
  @ApiResponse({
    status: 200,
    description: 'Data motivasi per program studi berhasil diambil',
  })
  async getProgramStats(): Promise<
    WebResponse<
      { programName: string; avgScore: number; totalStudents: number; totalAnalyses: number }[]
    >
  > {
    const data = await this.analyticsService.getPublicProgramStats();
    return buildWebResponse(HttpStatus.OK, 'Success', data);
  }
}
