import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { MotivationAnalysisService } from './motivation-analysis.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { WebResponse } from '../../common/dto/web-response.dto';
import { buildWebResponse } from '../../common/helpers';
import { MotivationAnalysisResponse, StudentGraphData } from './types';

@ApiTags('Motivation Analysis')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller(['motivation-analysis', 'analysis'])
export class MotivationAnalysisController {
  constructor(private readonly analysisService: MotivationAnalysisService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload audio dan analisis motivasi',
    description:
      'Mengirim audio ke AI Service dan menyimpan hasilnya ke database',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        studentId: { type: 'string' },
      },
      required: ['file', 'studentId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Analisis berhasil dilakukan' })
  async uploadAndAnalyze(
    @UploadedFile() file: Express.Multer.File,
    @Body() createAnalysisDto: CreateAnalysisDto,
  ): Promise<WebResponse<MotivationAnalysisResponse | null>> {
    const result = await this.analysisService.analyzeAndSave(
      file,
      createAnalysisDto,
    );
    return buildWebResponse(HttpStatus.CREATED, 'Analysis success', result);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Ambil semua riwayat analisis mahasiswa' })
  @ApiResponse({
    status: 200,
    description: 'Riwayat mahasiswa berhasil diambil',
  })
  async getStudentHistory(
    @Param('studentId') studentId: string,
  ): Promise<WebResponse<MotivationAnalysisResponse[]>> {
    const result = await this.analysisService.findByStudent(studentId);
    return buildWebResponse(
      HttpStatus.OK,
      'Get student history success',
      result,
    );
  }

  @Get('class/:classId')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Ambil semua analisis berdasarkan kelas' })
  @ApiResponse({
    status: 200,
    description: 'Riwayat analisis kelas berhasil diambil',
  })
  async getClassHistory(
    @Param('classId') classId: string,
  ): Promise<WebResponse<MotivationAnalysisResponse[]>> {
    const result = await this.analysisService.findByClass(classId);
    return buildWebResponse(
      HttpStatus.OK,
      'Get class analysis history success',
      result,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail hasil analisis berdasarkan ID' })
  @ApiResponse({ status: 200, description: 'Detail analisis berhasil diambil' })
  async findOne(
    @Param('id') id: string,
  ): Promise<WebResponse<MotivationAnalysisResponse | null>> {
    const result = await this.analysisService.findOne(id);
    return buildWebResponse(
      HttpStatus.OK,
      'Get analysis detail success',
      result,
    );
  }

  @Get()
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Ambil semua hasil analisis (Admin/Dosen)' })
  @ApiResponse({
    status: 200,
    description: 'Semua data analisis berhasil diambil',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<WebResponse<MotivationAnalysisResponse[]>> {
    const result = await this.analysisService.findAll(page, limit);
    return buildWebResponse(
      HttpStatus.OK,
      'Get all analysis success',
      result.data,
      result.meta,
    );
  }

  @Get('graph/student/:studentId')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Ambil data grafik untuk dashboard mahasiswa' })
  @ApiResponse({ status: 200, description: 'Data grafik berhasil diambil' })
  async getStudentGraph(
    @Param('studentId') studentId: string,
  ): Promise<WebResponse<StudentGraphData>> {
    const result = await this.analysisService.getStudentGraphData(studentId);
    return buildWebResponse(HttpStatus.OK, 'Get student graph success', result);
  }
}
