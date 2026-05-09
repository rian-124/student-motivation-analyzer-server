import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RecordingsService } from './recordings.service';
import { CreateRecordingDto } from './dto/create-recording.dto';

@ApiTags('Recordings')
@ApiBearerAuth('JWT-auth')
@Controller('recordings')
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file rekaman', description: 'Upload file audio/video rekaman mahasiswa (multipart/form-data)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File rekaman + informasi tambahan',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'File audio/video rekaman' },
        studentId: { type: 'string', example: 'uuid-mahasiswa', description: 'ID mahasiswa' },
        subject: { type: 'string', example: 'Pemrograman Web', description: 'Nama mata kuliah' },
        description: { type: 'string', example: 'Sesi bimbingan semester 5', description: 'Deskripsi rekaman' },
      },
      required: ['file', 'studentId', 'subject'],
    },
  })
  @ApiResponse({ status: 201, description: 'Rekaman berhasil diupload' })
  @ApiResponse({ status: 400, description: 'File tidak valid atau data tidak lengkap' })
  upload(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    @UploadedFile() file: any,
    @Body() createRecordingDto: CreateRecordingDto,
  ) {
    return this.recordingsService.upload(file, createRecordingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua rekaman', description: 'Mendukung pagination dengan query page & limit' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Halaman ke berapa' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Jumlah data per halaman' })
  @ApiResponse({ status: 200, description: 'Daftar rekaman berhasil diambil' })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.recordingsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil rekaman berdasarkan ID' })
  @ApiParam({ name: 'id', description: 'ID rekaman', example: 'uuid-rekaman' })
  @ApiResponse({ status: 200, description: 'Rekaman ditemukan' })
  @ApiResponse({ status: 404, description: 'Rekaman tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.recordingsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus rekaman' })
  @ApiParam({ name: 'id', description: 'ID rekaman', example: 'uuid-rekaman' })
  @ApiResponse({ status: 200, description: 'Rekaman berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Rekaman tidak ditemukan' })
  remove(@Param('id') id: string) {
    return this.recordingsService.remove(id);
  }
}
