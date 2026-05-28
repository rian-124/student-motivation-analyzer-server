import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from '../types/pagination-meta.type';

export class WebResponse<T> {
  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ example: 'Success' })
  message!: string;

  @ApiProperty()
  data?: T;

  @ApiProperty({ example: null, required: false })
  meta?: PaginationMeta;

  @ApiProperty({ example: null, required: false })
  errors?: string | string[];
}
