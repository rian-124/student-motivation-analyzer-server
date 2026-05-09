import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateLecturerDto {
  @ApiProperty({ example: '198501012010011001', description: 'Nomor Induk Pegawai (NIP) dosen' })
  @IsString()
  @IsNotEmpty()
  nip: string;

  @ApiProperty({ example: 'Dr. Ahmad Fauzi, M.Kom', description: 'Nama lengkap dosen' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Teknik Informatika', description: 'Jurusan / Program Studi dosen' })
  @IsString()
  @IsOptional()
  department?: string;
}
