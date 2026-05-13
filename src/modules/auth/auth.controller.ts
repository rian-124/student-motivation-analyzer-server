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
import { WebResponse } from '../../common/dto/web-response.dto';

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
  async login(@Body() loginDto: LoginDto): Promise<WebResponse<any>> {
    const result = await this.authService.login(loginDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Login success',
      data: result,
    };
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout pengguna',
    description: 'Menghapus refresh token pengguna',
  })
  @ApiResponse({ status: 200, description: 'Logout berhasil' })
  async logout(@CurrentUser() user: { id: string }): Promise<WebResponse<null>> {
    await this.authService.logout(user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Logout success',
      data: null,
    };
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh Token',
    description: 'Mendapatkan token baru menggunakan refresh token',
  })
  @ApiResponse({ status: 200, description: 'Token berhasil diperbarui' })
  async refreshTokens(@Req() req: Request): Promise<WebResponse<any>> {
    const user = req.user as { sub: string; refreshToken: string };
    const result = await this.authService.refreshTokens(
      user.sub,
      user.refreshToken,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Refresh token success',
      data: result,
    };
  }
}
