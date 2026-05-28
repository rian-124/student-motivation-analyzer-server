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
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

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
  @ApiOperation({ summary: 'Tambah mahasiswa baru' })
  @ApiResponse({ status: 201, description: 'Mahasiswa berhasil ditambahkan' })
  async create(@Body() createStudentDto: CreateStudentDto, @Request() req: any) {
    return this.studentsService.create(createStudentDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua mahasiswa' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(
    @Query('page') page?: number, 
    @Query('limit') limit?: number,
    @Request() req?: any
  ) {
    const user = req.user;
    
    // Jika dosen, hanya ambil mahasiswa perwaliannya
    if (user.role === Role.lecturer) {
      const lecturer = await this.prisma.lecturer.findUnique({
        where: { userId: user.id }
      });
      return this.studentsService.findAll(page, limit, lecturer?.id);
    }

    return this.studentsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil mahasiswa berdasarkan ID' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update data mahasiswa' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus mahasiswa' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
