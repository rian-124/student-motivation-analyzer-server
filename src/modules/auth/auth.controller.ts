import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard, JwtRefreshGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login pengguna',
    description: 'Mendapatkan access token dan refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil, tokens dikembalikan',
  })
  @ApiResponse({ status: 401, description: 'Email atau password salah' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout pengguna',
    description: 'Menghapus refresh token pengguna',
  })
  @ApiResponse({ status: 200, description: 'Logout berhasil' })
  async logout(@CurrentUser() user: { id: string }) {
    return this.authService.logout(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh Token',
    description: 'Mendapatkan token baru menggunakan refresh token',
  })
  @ApiResponse({ status: 200, description: 'Token berhasil diperbarui' })
  async refreshTokens(@Req() req: Request) {
    const user = req.user as { sub: string; refreshToken: string };
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }
}
