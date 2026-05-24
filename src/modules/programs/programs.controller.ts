import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProgramsService } from './programs.service';
import { ProgramDetailDto, ProgramListResponseDto } from './dto/program.dto';

@ApiTags('Programs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil semua program studi' })
  @ApiResponse({ status: 200, description: 'Daftar program studi berhasil diambil' })
  @ApiOkResponse({ type: ProgramListResponseDto })
  findAll() {
    return this.programsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail program studi' })
  @ApiResponse({ status: 200, description: 'Detail program studi berhasil diambil' })
  @ApiOkResponse({ type: ProgramDetailDto })
  findOne(@Param('id') id: string) {
    return this.programsService.findOne(id);
  }
}
