import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto) {
    // TODO: Implement with database
    return { message: 'User created' };
  }

  findAll(page?: number, limit?: number) {
    // TODO: Implement with database and pagination
    return { message: 'List all users' };
  }

  findOne(id: string) {
    // TODO: Implement with database
    return { message: `Get user #${id}` };
  }

  findByEmail(email: string) {
    // TODO: Implement with database
    return null;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    // TODO: Implement with database
    return { message: `Update user #${id}` };
  }

  remove(id: string) {
    // TODO: Implement with database
    return { message: `Remove user #${id}` };
  }
}
