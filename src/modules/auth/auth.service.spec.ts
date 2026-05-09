import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login()', () => {
    it('should return a message when called', async () => {
      const loginDto: LoginDto = {
        email: 'test@email.com',
        password: 'password123',
      };

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
    });
  });

  describe('register()', () => {
    it('should return a message when called', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@email.com',
        password: 'password123',
        role: 'student',
      };

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
    });
  });
});
