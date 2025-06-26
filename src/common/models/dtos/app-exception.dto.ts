import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    message: string | object,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    additionalInfo?: any,
  ) {
    super(
      {
        statusCode,
        message,
        additionalInfo,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}
