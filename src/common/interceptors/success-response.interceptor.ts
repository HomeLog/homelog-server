import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TResponse } from 'src/common/types/response.type';

@Injectable()
export class SuccessInterceptor<T> implements NestInterceptor<T, TResponse<T>> {
  intercept(_: ExecutionContext, next: CallHandler): Observable<TResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'result' in data &&
          'message' in data
        ) {
          return data;
        }
        return { success: true, result: data, message: null };
      }),
    );
  }
}
