import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login pengguna', description: 'Mendapatkan JWT token setelah login berhasil' })
  @ApiResponse({ status: 200, description: 'Login berhasil, token dikembalikan' })
  @ApiResponse({ status: 401, description: 'Email atau password salah' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrasi pengguna baru', description: 'Membuat akun pengguna baru di sistem' })
  @ApiResponse({ status: 201, description: 'Registrasi berhasil' })
  @ApiResponse({ status: 400, description: 'Data tidak valid atau email sudah terdaftar' })
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }
}
