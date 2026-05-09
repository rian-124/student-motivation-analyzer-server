import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@ApiTags('Students')
@ApiBearerAuth('JWT-auth')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiOperation({ summary: 'Tambah mahasiswa baru' })
  @ApiResponse({ status: 201, description: 'Mahasiswa berhasil ditambahkan' })
  @ApiResponse({ status: 400, description: 'Data tidak valid' })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua mahasiswa', description: 'Mendukung pagination dengan query page & limit' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Halaman ke berapa' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Jumlah data per halaman' })
  @ApiResponse({ status: 200, description: 'Daftar mahasiswa berhasil diambil' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.studentsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil mahasiswa berdasarkan ID' })
  @ApiParam({ name: 'id', description: 'ID mahasiswa', example: 'uuid-mahasiswa' })
  @ApiResponse({ status: 200, description: 'Mahasiswa ditemukan' })
  @ApiResponse({ status: 404, description: 'Mahasiswa tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update data mahasiswa' })
  @ApiParam({ name: 'id', description: 'ID mahasiswa', example: 'uuid-mahasiswa' })
  @ApiResponse({ status: 200, description: 'Data mahasiswa berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Mahasiswa tidak ditemukan' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus mahasiswa' })
  @ApiParam({ name: 'id', description: 'ID mahasiswa', example: 'uuid-mahasiswa' })
  @ApiResponse({ status: 200, description: 'Mahasiswa berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Mahasiswa tidak ditemukan' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
