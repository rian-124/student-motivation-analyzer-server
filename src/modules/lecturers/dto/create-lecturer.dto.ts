import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  IsUUID,
  IsArray,
} from 'class-validator';

export class CreateLecturerDto {
  @ApiProperty({
    example: '198501012010011001',
    description: 'Nomor Induk Pegawai (NIP) dosen',
  })
  @IsString()
  @IsNotEmpty()
  nip!: string;

  @ApiProperty({
    example: 'Dr. Ahmad Fauzi, M.Kom',
    description: 'Nama lengkap dosen',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'ahmad@lecturer.com',
    description: 'Email untuk akun dosen',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password untuk akun dosen',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({
    example: ['uuid-class-id-1', 'uuid-class-id-2'],
    description: 'Daftar ID kelas perwalian dosen',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  classIds?: string[];

  @ApiPropertyOptional({
    example: 'uuid-study-program-id',
    description: 'ID program studi dosen',
  })
  @IsUUID()
  @IsOptional()
  studyProgramId?: string;
}
