import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

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

  @ApiPropertyOptional({ example: 'TI-A', description: 'Kelas mahasiswa' })
  @IsString()
  @IsOptional()
  class?: string;

  @ApiPropertyOptional({
    example: '5',
    description: 'Semester aktif mahasiswa',
  })
  @IsString()
  @IsOptional()
  semester?: string;
}
