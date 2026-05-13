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
        // If the result already has a 'data' field (like paginated results),
        // we keep the whole object but ensure it's wrapped correctly if needed.
        // However, if we want to follow WebResponse, we should decide
        // if 'meta' goes inside 'data' or alongside it.
        // Typically, for paginated results: { data: [...], meta: {...} }
        
        const hasDataField = res && typeof res === 'object' && 'data' in res;
        
        return {
          statusCode,
          message: res?.message || 'Success',
          data: hasDataField ? res.data : res,
          meta: res?.meta, // Preserve meta if it exists
        };
      }),
    );
  }
}
