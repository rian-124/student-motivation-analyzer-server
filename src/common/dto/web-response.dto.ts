import { ApiProperty } from '@nestjs/swagger';

export class WebResponse<T> {
  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ example: 'Success' })
  message!: string;

  @ApiProperty()
  data?: T;

  @ApiProperty({ example: null, required: false })
  meta?: any;

  @ApiProperty({ example: null, required: false })
  errors?: any;
}
