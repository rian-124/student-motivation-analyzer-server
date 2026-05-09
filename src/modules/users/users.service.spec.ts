import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../../common/enums';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should return a message when user is created', () => {
      const dto: CreateUserDto = {
        name: 'Budi Santoso',
        email: 'budi@email.com',
        password: 'password123',
        role: Role.STUDENT,
      };

      const result = service.create(dto);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
    });
  });

  describe('findAll()', () => {
    it('should return a message when called', () => {
      const result = service.findAll();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('message');
    });
  });

  describe('findOne()', () => {
    it('should return a message with the given id', () => {
      const id = 'uuid-user';
      const result = service.findOne(id);

      expect(result).toBeDefined();
      expect((result as any).message).toContain(id);
    });
  });

  describe('findByEmail()', () => {
    it('should return null (not yet implemented)', () => {
      const result = service.findByEmail('test@email.com');
      expect(result).toBeNull();
    });
  });

  describe('remove()', () => {
    it('should return a message with the given id', () => {
      const id = 'uuid-user';
      const result = service.remove(id);

      expect(result).toBeDefined();
      expect((result as any).message).toContain(id);
    });
  });
});
