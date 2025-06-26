import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StringUtils {
  constructor() {}

  toObjectId(idString: string): Types.ObjectId {
    return new Types.ObjectId(idString);
  }

  randomId(): string {
    return uuidv4();
  }
}
