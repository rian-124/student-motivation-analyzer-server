import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnalysisDto {
  @ApiProperty({ example: 'uuid-mahasiswa', description: 'ID Mahasiswa' })
  @IsNotEmpty()
  @IsUUID()
  studentId!: string;

  @ApiProperty({
    example: 'Sesi hari Senin',
    description: 'Deskripsi tambahan atau catatan harian',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
