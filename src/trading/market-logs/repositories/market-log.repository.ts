import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MarketLog } from 'src/common/models/entities/market-log.entity';

@Injectable()
export class MarketLogRepository {
  constructor(
    @InjectModel(MarketLog.name) private marketLogModel: Model<MarketLog>,
  ) {}

  async saveMany(logs: Partial<MarketLog>[]): Promise<any[]> {
    if (!logs || logs.length === 0) {
      throw new Error('The logs array must not be empty.');
    }
    const savedLogs = await this.marketLogModel.insertMany(logs);
    return savedLogs;
  }
}
