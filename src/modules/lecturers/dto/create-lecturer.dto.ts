import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  IsUUID,
} from 'class-validator';

export class CreateLecturerDto {
  @ApiProperty({
    example: '198501012010011001',
    description: 'Nomor Induk Pegawai (NIP) dosen',
  })
  @IsString()
  @IsNotEmpty()
  nip: string;

  @ApiProperty({
    example: 'Dr. Ahmad Fauzi, M.Kom',
    description: 'Nama lengkap dosen',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'ahmad@lecturer.com',
    description: 'Email untuk akun dosen',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password untuk akun dosen',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    example: 'Teknik Informatika',
    description: 'Jurusan / Program Studi dosen',
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({
    example: 'TI-2021-A',
    description: 'Nama kelas (legacy compatibility)',
  })
  @IsString()
  @IsOptional()
  class?: string;

  @ApiPropertyOptional({
    example: 'uuid-class-id',
    description: 'ID kelas yang diampu dosen',
  })
  @IsUUID()
  @IsOptional()
  classId?: string;

  @ApiPropertyOptional({
    example: 'uuid-study-program-id',
    description: 'ID program studi dosen',
  })
  @IsUUID()
  @IsOptional()
  studyProgramId?: string;
}
