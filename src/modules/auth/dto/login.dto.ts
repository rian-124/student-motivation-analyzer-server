import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'mahasiswa@email.com',
    description: 'Email yang digunakan untuk login',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password akun',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
