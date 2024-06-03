import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { TExceptionResponse, TResponse } from 'src/types/response.type';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ErrorResponse: TResponse<null> = {
      success: false,
      result: null,
      message: this.getMessage(exception),
    };

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();

    response.status(statusCode).json(ErrorResponse);
  }

  private getMessage(exception: HttpException) {
    const exceptionResponse = exception.getResponse() as TExceptionResponse;

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse.message;

    return message;
  }
}
