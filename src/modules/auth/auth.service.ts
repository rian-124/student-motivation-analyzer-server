import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  async login(loginDto: LoginDto) {
    // TODO: Implement login logic with JWT
    return { message: 'Login endpoint' };
  }

  async register(registerDto: any) {
    // TODO: Implement register logic
    return { message: 'Register endpoint' };
  }
}
