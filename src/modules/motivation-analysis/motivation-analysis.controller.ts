import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MotivationAnalysisService } from './motivation-analysis.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';

@ApiTags('Motivation Analysis')
@ApiBearerAuth('JWT-auth')
@Controller('motivation-analysis')
export class MotivationAnalysisController {
  constructor(
    private readonly motivationAnalysisService: MotivationAnalysisService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Mulai analisis motivasi',
    description: 'Menjalankan analisis motivasi berbasis AI terhadap rekaman mahasiswa',
  })
  @ApiResponse({ status: 201, description: 'Analisis berhasil dimulai' })
  @ApiResponse({ status: 400, description: 'Data tidak valid' })
  @ApiResponse({ status: 404, description: 'Rekaman atau mahasiswa tidak ditemukan' })
  analyze(@Body() createAnalysisDto: CreateAnalysisDto) {
    return this.motivationAnalysisService.analyze(createAnalysisDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua hasil analisis', description: 'Mendukung pagination dengan query page & limit' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Halaman ke berapa' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Jumlah data per halaman' })
  @ApiResponse({ status: 200, description: 'Daftar hasil analisis berhasil diambil' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.motivationAnalysisService.findAll(page, limit);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Ambil semua analisis berdasarkan mahasiswa' })
  @ApiParam({ name: 'studentId', description: 'ID mahasiswa', example: 'uuid-mahasiswa' })
  @ApiResponse({ status: 200, description: 'Riwayat analisis mahasiswa berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Mahasiswa tidak ditemukan' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.motivationAnalysisService.findByStudent(studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil hasil analisis berdasarkan ID' })
  @ApiParam({ name: 'id', description: 'ID hasil analisis', example: 'uuid-analisis' })
  @ApiResponse({ status: 200, description: 'Hasil analisis ditemukan' })
  @ApiResponse({ status: 404, description: 'Hasil analisis tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.motivationAnalysisService.findOne(id);
  }
}
