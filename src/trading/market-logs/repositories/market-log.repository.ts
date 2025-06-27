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

  async findUncheckedProfitabilityLogsBatch(
    batchSize: number,
    skip: number,
  ): Promise<MarketLog[]> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return await this.marketLogModel
      .find({
        // wasProfitable: null,
        // profitabilityCheckedAt: null,
        createdAt: { $gte: oneDayAgo },
      })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(batchSize)
      .exec();
  }

  async findUncheckedProfitabilityLogsBatchFromLast24Hours(
    batchSize: number,
    skip: number,
    last24Hours: Date,
  ): Promise<MarketLog[]> {
    return await this.marketLogModel
      .find({
        createdAt: { $gte: last24Hours },
      })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(batchSize)
      .exec();
  }

  async findLogsByAssetAndTimeWindow(
    from: string,
    startTime: Date,
    hoursWindow: number,
  ): Promise<MarketLog[]> {
    const endTime = new Date(
      startTime.getTime() + hoursWindow * 60 * 60 * 1000,
    );

    const result = await this.marketLogModel
      .find({
        from: from,
        createdAt: {
          $gte: startTime,
          $lte: endTime,
        },
      })
      .sort({ createdAt: 1 })
      .exec();

    return result;
  }

  async updateLogProfitability(
    logId: string,
    wasProfitable: boolean,
    maxPriceChangePercent: number,
    checkedAt: Date,
    timeToReach?: string,
  ): Promise<void> {
    const updateData: any = {
      wasProfitable,
      maxPriceChangePercent,
      profitabilityCheckedAt: checkedAt,
    };

    if (timeToReach) {
      updateData.timeToReach = timeToReach;
    }

    await this.marketLogModel
      .updateOne({ _id: logId }, { $set: updateData })
      .exec();
  }

  async findProfitableLogs(): Promise<MarketLog[]> {
    return await this.marketLogModel
      .find({
        wasProfitable: true,
        maxPriceChangePercent: { $exists: true, $ne: null },
      })
      .sort({ maxPriceChangePercent: -1 })
      .exec();
  }

  async findProfitableLogsFromLast24Hours(
    last24Hours: Date,
  ): Promise<MarketLog[]> {
    return await this.marketLogModel
      .find({
        wasProfitable: true,
        maxPriceChangePercent: { $exists: true, $ne: null },
        createdAt: { $gte: last24Hours },
      })
      .sort({ maxPriceChangePercent: -1 })
      .exec();
  }
}
