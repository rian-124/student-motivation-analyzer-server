import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  create(createStudentDto: CreateStudentDto) {
    // TODO: Implement with database
    return { message: 'Student created' };
  }

  findAll(page?: number, limit?: number) {
    // TODO: Implement with database and pagination
    return { message: 'List all students' };
  }

  findOne(id: string) {
    // TODO: Implement with database
    return { message: `Get student #${id}` };
  }

  update(id: string, updateStudentDto: UpdateStudentDto) {
    // TODO: Implement with database
    return { message: `Update student #${id}` };
  }

  remove(id: string) {
    // TODO: Implement with database
    return { message: `Remove student #${id}` };
  }
}
