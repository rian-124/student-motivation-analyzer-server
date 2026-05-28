import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../../common/types';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@Controller(['motivation-stats', 'analytics'])
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Ambil statistik motivasi' })
  async getStats(@Request() req: AuthenticatedRequest) {
    return this.analyticsService.getStats(req.user.id, req.user.role);
  }

  @Get('charts')
  @ApiOperation({ summary: 'Ambil data grafik motivasi' })
  async getCharts(@Request() req: AuthenticatedRequest) {
    return this.analyticsService.getCharts(req.user.id, req.user.role);
  }
}
