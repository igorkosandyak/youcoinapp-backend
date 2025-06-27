import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MarketLogRepository } from '../repositories/market-log.repository';
import { MarketLog } from 'src/common/models/entities/market-log.entity';

@Injectable()
export class MarketLogCreatorService implements OnModuleInit {
  private readonly logger = new Logger(MarketLogCreatorService.name);

  constructor(private readonly marketLogRepository: MarketLogRepository) {}

  async onModuleInit() {
    // this.logger.log('MarketLogCreatorService initialized');
    // await this.clearAllProfitabilityData();
  }

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

  async clearProfitabilityData(
    fromDate?: Date,
    toDate?: Date,
    asset?: string,
  ): Promise<{ updatedCount: number }> {
    try {
      this.logger.log('🧹 Starting profitability data cleanup...');

      const filter: any = {};

      // Add date range filter if provided
      if (fromDate || toDate) {
        filter.createdAt = {};
        if (fromDate) filter.createdAt.$gte = fromDate;
        if (toDate) filter.createdAt.$lte = toDate;
      }

      // Add asset filter if provided
      if (asset) {
        filter.from = asset;
      }

      const result =
        await this.marketLogRepository.clearProfitabilityData(filter);

      this.logger.log(
        `✅ Successfully cleared profitability data for ${result.updatedCount} market logs`,
      );

      if (fromDate || toDate) {
        const dateRange = `${fromDate?.toISOString() || 'beginning'} to ${toDate?.toISOString() || 'now'}`;
        this.logger.log(`📅 Date range: ${dateRange}`);
      }

      if (asset) {
        this.logger.log(`🎯 Asset: ${asset}`);
      }

      return { updatedCount: result.updatedCount };
    } catch (error) {
      this.logger.error('❌ Error clearing profitability data:', error);
      throw error;
    }
  }

  async clearAllProfitabilityData(): Promise<{ updatedCount: number }> {
    try {
      this.logger.log('🧹 Clearing ALL profitability data from market logs...');

      const result = await this.marketLogRepository.clearAllProfitabilityData();

      this.logger.log(
        `✅ Successfully cleared profitability data for ${result.updatedCount} market logs`,
      );

      return { updatedCount: result.updatedCount };
    } catch (error) {
      this.logger.error('❌ Error clearing all profitability data:', error);
      throw error;
    }
  }
}
