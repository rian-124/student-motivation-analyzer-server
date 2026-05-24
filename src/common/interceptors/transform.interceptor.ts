import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WebResponse } from '../dto/web-response.dto';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, WebResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<WebResponse<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((res) => {
        const hasDataField = res && typeof res === 'object' && 'data' in res;

        return {
          success: true,
          statusCode,
          message: res?.message || 'Success',
          data: hasDataField ? res.data : res,
          meta: res?.meta,
        };
      }),
    );
  }
}
