import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { TExceptionResponse, TResponse } from 'src/common/types/response.type';
import { ServiceException } from '../errors/service.exception';

type ErrorWithStatus = Error & { getStatus?: () => number };

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: ErrorWithStatus, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = this.getMessage(exception);
    const statusCode = this.getStatusCode(exception);

    const errorResponse: TResponse<null> = {
      success: false,
      result: null,
      message,
    };

    return response.status(statusCode).json(errorResponse);
  }

  private getStatusCode(exception: ErrorWithStatus): number {
    if (
      exception instanceof HttpException ||
      exception instanceof ServiceException
    ) {
      return exception.getStatus();
    }
    return HttpStatus.BAD_REQUEST;
  }

  private getMessage(exception: ErrorWithStatus): string {
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse() as TExceptionResponse;
      return typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse.message;
    }
    return exception.message;
  }
}
