import { Injectable } from '@nestjs/common';
import { MarketLogRepository } from '../repositories/market-log.repository';
import { MarketLog } from 'src/common/models/entities/market-log.entity';

@Injectable()
export class MarketLogCreatorService {
  constructor(private readonly marketLogRepository: MarketLogRepository) {}

  async insert(logs: Partial<MarketLog>[]): Promise<any[]> {
    return this.marketLogRepository.saveMany(logs);
  }
}
