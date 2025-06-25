import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse = {
      statusCode: status,
      message: this._getMessage(exception) || 'Internal server error',
      error: exception.name || 'InternalError',
      timestamp: new Date().toISOString(),
      path: context.getRequest().url,
    };

    response.status(status).json(errorResponse);
  }

  private _getMessage(exception: any): string {
    if (exception.response) {
      const { message } = exception.response;
      if (Array.isArray(message)) {
        return message.join(', ');
      }
      return message || exception.response || exception.message;
    }
    return exception.message || null;
  }
}
