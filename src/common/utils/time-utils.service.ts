import { Injectable } from '@nestjs/common';

@Injectable()
export class TimeUtils {
  constructor() {}

  async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
