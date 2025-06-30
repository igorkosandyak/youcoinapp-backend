import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ProfitableMarketLogRepository } from '../repositories/profitable-market-log.repository';
import { ProfitableMarketLog } from 'src/common/models/entities/profitable-market-log.entity';
import { MarketLog } from 'src/common/models/entities/market-log.entity';
import { VectorEncoderService } from 'src/learning/services/vector-encoder.service';

@Injectable()
export class ProfitableMarketLogCreatorService implements OnModuleInit {
  private readonly logger = new Logger(ProfitableMarketLogCreatorService.name);

  constructor(
    private readonly profitableMarketLogRepository: ProfitableMarketLogRepository,
    private readonly vectorEncoderService: VectorEncoderService,
  ) {}

  async onModuleInit() {
    this.logger.log('ProfitableMarketLogCreatorService initialized');
  }

  async saveProfitableMarketLogs(
    profitableLogs: MarketLog[],
    analysisType: string = 'daily',
  ): Promise<ProfitableMarketLog[]> {
    try {
      profitableLogs = profitableLogs.filter(log => log.maxPriceChangePercent > 2.5);
      this.logger.log(`Saving ${profitableLogs.length} profitable market logs to collection`);

      const profitableMarketLogs = profitableLogs.map(log => {
        const logObject = typeof log.toObject === 'function' ? log.toObject() : { ...log };

        this.logger.debug(
          `Processing log for ${logObject.from}: currentPrice=${logObject.currentPrice}, change_1h=${logObject.change_1h}, _5minTrend=${logObject._5minTrend}`,
        );

        const profitableLog = {
          ...logObject,
          analysisDate: new Date(),
          analysisType,
          originalMarketLogId: log._id.toString(),
          vectorData: this.vectorEncoderService.encode(log),
        };

        this.logger.debug(
          `Vector data for ${logObject.from}: length=${profitableLog.vectorData.length}, first 5 values=${profitableLog.vectorData.slice(0, 5).join(', ')}`,
        );

        delete profitableLog._id;
        delete profitableLog.__v;

        return profitableLog;
      });

      const savedLogs = await this.profitableMarketLogRepository.saveMany(profitableMarketLogs);

      this.logger.log(`Successfully saved ${savedLogs.length} profitable market logs`);
      return savedLogs;
    } catch (error) {
      this.logger.error('Error saving profitable market logs:', error);
      throw error;
    }
  }

  async saveSingleProfitableMarketLog(
    marketLog: MarketLog,
    analysisType: string = 'daily',
  ): Promise<ProfitableMarketLog> {
    try {
      const logObject = typeof marketLog.toObject === 'function' ? marketLog.toObject() : { ...marketLog };

      const profitableLog = {
        ...logObject,
        analysisDate: new Date(),
        analysisType,
        originalMarketLogId: marketLog._id.toString(),
        vectorData: this.vectorEncoderService.encode(marketLog),
      };

      delete profitableLog._id;
      delete profitableLog.__v;

      const savedLog = await this.profitableMarketLogRepository.save(profitableLog);

      this.logger.log(`Successfully saved profitable market log for ${marketLog.from}`);
      return savedLog;
    } catch (error) {
      this.logger.error(`Error saving profitable market log for ${marketLog.from}:`, error);
      throw error;
    }
  }

  async getProfitableLogsStats(): Promise<{
    totalCount: number;
    averageProfitability: number;
    topAsset: string;
    topProfitability: number;
  }> {
    return await this.profitableMarketLogRepository.getProfitableLogsStats();
  }

  async findTopProfitableLogs(limit: number = 10): Promise<ProfitableMarketLog[]> {
    return await this.profitableMarketLogRepository.findTopProfitableLogs(limit);
  }

  async findProfitableLogsByAsset(asset: string): Promise<ProfitableMarketLog[]> {
    return await this.profitableMarketLogRepository.findProfitableLogsByAsset(asset);
  }

  async findProfitableLogsByDateRange(startDate: Date, endDate: Date): Promise<ProfitableMarketLog[]> {
    return await this.profitableMarketLogRepository.findProfitableLogsByDateRange(startDate, endDate);
  }

  async cleanupOldProfitableLogs(olderThanDays: number = 30): Promise<number> {
    const deletedCount = await this.profitableMarketLogRepository.deleteOldProfitableLogs(olderThanDays);
    this.logger.log(`Cleaned up ${deletedCount} old profitable market logs (older than ${olderThanDays} days)`);
    return deletedCount;
  }
}
