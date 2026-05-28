import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedRequest } from '../../common/types';

@ApiTags('Students')
@ApiBearerAuth('JWT-auth')
@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tambah mahasiswa baru' })
  @ApiResponse({ status: 201, description: 'Mahasiswa berhasil ditambahkan' })
  async create(
    @Body() createStudentDto: CreateStudentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.studentsService.create(createStudentDto, req.user);
  }

  @Get()
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Ambil semua mahasiswa' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'classId', required: false })
  @ApiQuery({ name: 'prediction', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('classId') classId?: string,
    @Query('prediction') prediction?: string,
    @Request() req?: AuthenticatedRequest,
  ) {
    const user = req?.user;
    if (!user) {
      return this.studentsService.findAll(page, limit, undefined, classId, prediction);
    }

    // Jika dosen, hanya ambil mahasiswa perwaliannya
    if (user.role === Role.LECTURER) {
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { userId: user.id },
      });
      return this.studentsService.findAll(page, limit, lecturer?.id, classId, prediction);
    }

    return this.studentsService.findAll(page, limit, undefined, classId, prediction);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Ambil mahasiswa berdasarkan ID' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update data mahasiswa' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Hapus mahasiswa' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
