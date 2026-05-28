import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WebResponse } from '../dto/web-response.dto';
import { PaginationMeta } from '../types/pagination-meta.type';

type ResponseWithData<T> = {
  message?: string;
  data: T;
  meta?: PaginationMeta;
};

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  WebResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<WebResponse<T>> {
    const response = context
      .switchToHttp()
      .getResponse<{ statusCode: number }>();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((res: T | ResponseWithData<T>) => {
        const hasDataField =
          typeof res === 'object' && res !== null && 'data' in res;
        const mappedMessage =
          typeof res === 'object' && res !== null && 'message' in res
            ? (res.message ?? 'Success')
            : 'Success';
        const mappedMeta: PaginationMeta | undefined =
          typeof res === 'object' && res !== null && 'meta' in res
            ? res.meta
            : undefined;

        return {
          success: true,
          statusCode,
          message: mappedMessage,
          data: hasDataField ? res.data : res,
          meta: mappedMeta,
        };
      }),
    );
  }
}
