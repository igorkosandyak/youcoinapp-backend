import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProfitableMarketLog } from 'src/common/models/entities/profitable-market-log.entity';

@Injectable()
export class ProfitableMarketLogRepository {
  constructor(
    @InjectModel(ProfitableMarketLog.name)
    private readonly profitableMarketLogModel: Model<ProfitableMarketLog>,
  ) {}

  async saveMany(profitableLogs: Partial<ProfitableMarketLog>[]): Promise<any[]> {
    return await this.profitableMarketLogModel.insertMany(profitableLogs);
  }

  async save(profitableLog: Partial<ProfitableMarketLog>): Promise<ProfitableMarketLog> {
    const newLog = new this.profitableMarketLogModel(profitableLog);
    return await newLog.save();
  }

  async findBestProfitableLogsPerAsset(analysisDate: Date): Promise<ProfitableMarketLog[]> {
    return await this.profitableMarketLogModel
      .find({
        analysisDate: {
          $gte: new Date(analysisDate.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
          $lte: analysisDate,
        },
      })
      .sort({ maxPriceChangePercent: -1 })
      .exec();
  }

  async findProfitableLogsByDateRange(startDate: Date, endDate: Date): Promise<ProfitableMarketLog[]> {
    return await this.profitableMarketLogModel
      .find({
        analysisDate: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ maxPriceChangePercent: -1 })
      .exec();
  }

  async findProfitableLogsByAsset(asset: string): Promise<ProfitableMarketLog[]> {
    return await this.profitableMarketLogModel.find({ from: asset }).sort({ analysisDate: -1 }).exec();
  }

  async findTopProfitableLogs(limit: number = 10): Promise<ProfitableMarketLog[]> {
    return await this.profitableMarketLogModel.find().sort({ maxPriceChangePercent: -1 }).limit(limit).exec();
  }

  async findProfitableLogsByAnalysisType(analysisType: string): Promise<ProfitableMarketLog[]> {
    return await this.profitableMarketLogModel.find({ analysisType }).sort({ analysisDate: -1 }).exec();
  }

  async deleteOldProfitableLogs(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const result = await this.profitableMarketLogModel.deleteMany({
      analysisDate: { $lt: cutoffDate },
    });
    return result.deletedCount;
  }

  async getProfitableLogsStats(): Promise<{
    totalCount: number;
    averageProfitability: number;
    topAsset: string;
    topProfitability: number;
  }> {
    const totalCount = await this.profitableMarketLogModel.countDocuments();

    const avgResult = await this.profitableMarketLogModel.aggregate([
      {
        $group: {
          _id: null,
          avgProfitability: { $avg: '$maxPriceChangePercent' },
        },
      },
    ]);

    const topLog = await this.profitableMarketLogModel.findOne().sort({ maxPriceChangePercent: -1 }).exec();

    return {
      totalCount,
      averageProfitability: avgResult[0]?.avgProfitability || 0,
      topAsset: topLog?.from || '',
      topProfitability: topLog?.maxPriceChangePercent || 0,
    };
  }
}
