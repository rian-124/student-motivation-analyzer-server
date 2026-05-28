import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  IsUUID,
} from 'class-validator';

export class UpdateStudentDto {
  @ApiPropertyOptional({
    example: '2021001',
    description: 'Nomor Induk Mahasiswa (NIM)',
  })
  @IsString()
  @IsOptional()
  nim?: string;

  @ApiPropertyOptional({
    example: 'Budi Santoso',
    description: 'Nama lengkap mahasiswa',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'TI-A',
    description: 'Nama kelas (legacy compatibility)',
  })
  @IsString()
  @IsOptional()
  class?: string;

  @ApiPropertyOptional({
    example: 'uuid-class-id',
    description: 'ID kelas utama mahasiswa',
  })
  @IsUUID()
  @IsOptional()
  classId?: string;

  @ApiPropertyOptional({
    example: 'uuid-study-program-id',
    description: 'ID program studi mahasiswa',
  })
  @IsUUID()
  @IsOptional()
  studyProgramId?: string;

  @ApiPropertyOptional({
    example: '5',
    description: 'Semester aktif mahasiswa',
  })
  @IsString()
  @IsOptional()
  semester?: string;

  @ApiPropertyOptional({
    example: 'uuid-lecturer-id',
    description: 'ID Dosen Wali',
  })
  @IsUUID()
  @IsOptional()
  lecturerId?: string;

  @ApiPropertyOptional({
    example: 'newpassword123',
    description: 'Password baru untuk akun mahasiswa (opsional)',
  })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}
