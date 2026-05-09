import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateRecordingDto {
  @ApiProperty({ example: 'uuid-mahasiswa', description: 'ID mahasiswa pemilik rekaman' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: 'Pemrograman Web', description: 'Nama mata kuliah' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiPropertyOptional({ example: 'Rekaman sesi bimbingan semester 5', description: 'Deskripsi rekaman' })
  @IsString()
  @IsOptional()
  description?: string;
}
