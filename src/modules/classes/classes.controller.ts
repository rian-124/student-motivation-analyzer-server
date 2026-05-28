import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ClassesService } from './classes.service';
import {
  ClassDetailDto,
  ClassLeaderboardResponseDto,
  ClassListResponseDto,
  ClassStudentsResponseDto,
} from './dto/class.dto';

@ApiTags('Classes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil semua kelas' })
  @ApiResponse({ status: 200, description: 'Daftar kelas berhasil diambil' })
  @ApiOkResponse({ type: ClassListResponseDto })
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail kelas' })
  @ApiResponse({ status: 200, description: 'Detail kelas berhasil diambil' })
  @ApiOkResponse({ type: ClassDetailDto })
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Ambil mahasiswa berdasarkan kelas' })
  @ApiResponse({ status: 200, description: 'Mahasiswa kelas berhasil diambil' })
  @ApiOkResponse({ type: ClassStudentsResponseDto })
  getStudentsByClassId(@Param('id') id: string) {
    return this.classesService.getStudentsByClassId(id);
  }

  @Get(':id/leaderboard')
  @ApiOperation({ summary: 'Ambil leaderboard kelas' })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard kelas berhasil diambil',
  })
  @ApiOkResponse({ type: ClassLeaderboardResponseDto })
  getLeaderboard(@Param('id') id: string) {
    return this.classesService.getLeaderboard(id);
  }
}
