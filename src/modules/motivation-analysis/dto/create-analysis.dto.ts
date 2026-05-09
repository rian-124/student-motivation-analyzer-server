import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateAnalysisDto {
  @ApiProperty({ example: 'uuid-rekaman', description: 'ID rekaman yang akan dianalisis' })
  @IsString()
  @IsNotEmpty()
  recordingId: string;

  @ApiProperty({ example: 'uuid-mahasiswa', description: 'ID mahasiswa yang dianalisis' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ example: 'Mahasiswa terlihat kurang antusias', description: 'Catatan tambahan dari dosen' })
  @IsString()
  @IsOptional()
  notes?: string;
}
