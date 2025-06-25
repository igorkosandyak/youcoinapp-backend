import { Module } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/exceptions.filter';

@Module({
  providers: [GlobalExceptionFilter],
  exports: [GlobalExceptionFilter],
})
export class CommonModule {}
