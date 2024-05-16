import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TResponse } from 'src/types/response.type';

@Injectable()
export class SuccessInterceptor<T> implements NestInterceptor<T, TResponse<T>> {
  intercept(_: ExecutionContext, next: CallHandler): Observable<TResponse<T>> {
    return next
      .handle()
      .pipe(map((data) => ({ success: true, result: data, message: null })));
  }
}
