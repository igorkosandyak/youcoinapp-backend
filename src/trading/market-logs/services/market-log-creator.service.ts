import { Injectable } from '@nestjs/common';
import { MarketLogRepository } from '../repositories/market-log.repository';
import { MarketLog } from 'src/common/models/entities/market-log.entity';

@Injectable()
export class MarketLogCreatorService {
  constructor(private readonly marketLogRepository: MarketLogRepository) {}

  async insert(logs: Partial<MarketLog>[]): Promise<any[]> {
    return this.marketLogRepository.saveMany(logs);
  }

  async updateLogProfitability(
    logId: string,
    isProfitable: boolean,
    maxPriceChange: number,
    checkedAt: Date,
    timeToReach?: string,
  ) {
    return this.marketLogRepository.updateLogProfitability(
      logId,
      isProfitable,
      maxPriceChange,
      checkedAt,
      timeToReach,
    );
  }
}
