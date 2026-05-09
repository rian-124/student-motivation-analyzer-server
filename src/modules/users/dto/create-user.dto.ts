import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../../../common/enums';

export class CreateUserDto {
  @ApiProperty({ example: 'Budi Santoso', description: 'Nama lengkap user' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'budi@email.com', description: 'Alamat email user' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password minimal 6 karakter',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: Role.STUDENT,
    enum: Role,
    description: 'Role user dalam sistem',
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
