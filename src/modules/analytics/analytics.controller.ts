import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../../common/types';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@Controller(['motivation-stats', 'analytics'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.LECTURER)
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
