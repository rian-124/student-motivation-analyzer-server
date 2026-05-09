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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LecturersService } from './lecturers.service';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';

@ApiTags('Lecturers')
@ApiBearerAuth('JWT-auth')
@Controller('lecturers')
export class LecturersController {
  constructor(private readonly lecturersService: LecturersService) {}

  @Post()
  @ApiOperation({ summary: 'Tambah dosen baru' })
  @ApiResponse({ status: 201, description: 'Dosen berhasil ditambahkan' })
  @ApiResponse({ status: 400, description: 'Data tidak valid' })
  create(@Body() createLecturerDto: CreateLecturerDto) {
    return this.lecturersService.create(createLecturerDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Ambil semua dosen',
    description: 'Mendukung pagination dengan query page & limit',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Halaman ke berapa',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Jumlah data per halaman',
  })
  @ApiResponse({ status: 200, description: 'Daftar dosen berhasil diambil' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.lecturersService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil dosen berdasarkan ID' })
  @ApiParam({ name: 'id', description: 'ID dosen', example: 'uuid-dosen' })
  @ApiResponse({ status: 200, description: 'Dosen ditemukan' })
  @ApiResponse({ status: 404, description: 'Dosen tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.lecturersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update data dosen' })
  @ApiParam({ name: 'id', description: 'ID dosen', example: 'uuid-dosen' })
  @ApiResponse({ status: 200, description: 'Data dosen berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Dosen tidak ditemukan' })
  update(
    @Param('id') id: string,
    @Body() updateLecturerDto: UpdateLecturerDto,
  ) {
    return this.lecturersService.update(id, updateLecturerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus dosen' })
  @ApiParam({ name: 'id', description: 'ID dosen', example: 'uuid-dosen' })
  @ApiResponse({ status: 200, description: 'Dosen berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Dosen tidak ditemukan' })
  remove(@Param('id') id: string) {
    return this.lecturersService.remove(id);
  }
}
