import { Controller, Get, UseGuards, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { WebResponse } from '../../common/dto/web-response.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Ambil profil user yang sedang login' })
  @ApiResponse({ status: 200, description: 'Profil berhasil diambil' })
  async getMe(@CurrentUser() user: { id: string }): Promise<WebResponse<any>> {
    const userData = await this.usersService.findOne(user.id);
    const { id: _id, refreshToken: _refreshToken, ...result } = userData;
    return {
      statusCode: HttpStatus.OK,
      message: 'Get profile success',
      data: result,
    };
  }
}
