import { WebResponse } from '../dto/web-response.dto';
import { PaginationMeta } from '../types/pagination-meta.type';

export function buildWebResponse<T>(
  statusCode: number,
  message: string,
  data: T,
  meta?: PaginationMeta,
): WebResponse<T> {
  return {
    statusCode,
    message,
    data,
    meta,
  };
}
