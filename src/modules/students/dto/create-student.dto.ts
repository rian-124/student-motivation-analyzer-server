import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  IsUUID,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({
    example: '2021001',
    description: 'Nomor Induk Mahasiswa (NIM)',
  })
  @IsString()
  @IsNotEmpty()
  nim: string;

  @ApiProperty({
    example: 'Budi Santoso',
    description: 'Nama lengkap mahasiswa',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'budi@student.com',
    description: 'Email untuk akun mahasiswa',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password untuk akun mahasiswa',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

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
}
