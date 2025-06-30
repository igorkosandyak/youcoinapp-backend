import { Injectable, Logger } from '@nestjs/common';
import { MarketLog } from 'src/common/models/entities/market-log.entity';
import { CalcUtils } from 'src/common/utils/calc-utils.service';
import { MarketLogCreatorService } from 'src/trading/market-logs/services/market-log-creator.service';
import { MarketLogFetcherService } from 'src/trading/market-logs/services/market-log-fetcher.service';

interface AnalysisConfig {
  readonly MAX_HOURS_TO_CHECK: number;
  readonly PROFIT_THRESHOLD_PERCENT: number;
  readonly BATCH_SIZE: number;
  readonly ANALYSIS_DAYS_BACK: number;
}

@Injectable()
export class LabelingService {
  private readonly logger = new Logger(LabelingService.name);
  private readonly analysisConfig: AnalysisConfig = {
    MAX_HOURS_TO_CHECK: 24,
    PROFIT_THRESHOLD_PERCENT: 2.0,
    BATCH_SIZE: 400,
    ANALYSIS_DAYS_BACK: 10,
  };

  constructor(
    private readonly marketLogFetcherService: MarketLogFetcherService,
    private readonly marketLogCreatorService: MarketLogCreatorService,
    private readonly calcUtils: CalcUtils,
  ) {}

  async analyzeMarketLogsProfitability(): Promise<MarketLog[]> {
    this.logger.log(
      `Analyzing market logs profitability for the last ${this.analysisConfig.ANALYSIS_DAYS_BACK} days`,
    );

    const profitableLogs = await this.processLogsFromLastDays();
    const bestLogsPerAsset = this.selectBestLogsPerAsset(profitableLogs);
    const sortedResult = this.sortLogsByProfitability(bestLogsPerAsset);

    this.logAnalysisResults(sortedResult);
    return sortedResult;
  }

  async getBestProfitableLogsPerAsset(): Promise<MarketLog[]> {
    this.logger.log(
      `Retrieving best profitable logs per asset from the last ${this.analysisConfig.ANALYSIS_DAYS_BACK} days...`,
    );

    const profitableLogs = await this.findProfitableLogsFromLastDays();
    const bestLogsPerAsset = this.selectBestLogsPerAsset(profitableLogs);
    const sortedResult = this.sortLogsByProfitability(bestLogsPerAsset);

    this.logger.log(
      `Retrieved ${sortedResult.length} best profitable logs per asset from last ${this.analysisConfig.ANALYSIS_DAYS_BACK} days.`,
    );
    return sortedResult;
  }

  async analyzeAndGetBestProfitableLogs(): Promise<MarketLog[]> {
    this.logger.log(
      'Starting profitability analysis and collecting best logs...',
    );

    await this.analyzeMarketLogsProfitability();
    return await this.getBestProfitableLogsPerAsset();
  }

  private async processLogsFromLastDays(): Promise<MarketLog[]> {
    const profitableLogs: MarketLog[] = [];
    let processedCount = 0;
    let hasMoreLogs = true;
    const startDate = this.getStartDate();

    while (hasMoreLogs) {
      const uncheckedLogs = await this.fetchUncheckedLogsBatchFromLastDays(
        processedCount,
        startDate,
      );

      if (uncheckedLogs.length === 0) {
        hasMoreLogs = false;
        continue;
      }

      const batchProfitableLogs = await this.processLogsBatch(uncheckedLogs);
      profitableLogs.push(...batchProfitableLogs);
      processedCount += uncheckedLogs.length;
    }

    return profitableLogs;
  }

  private async fetchUncheckedLogsBatchFromLastDays(
    skip: number,
    startDate: Date,
  ): Promise<MarketLog[]> {
    return await this.marketLogFetcherService.findUncheckedProfitabilityLogsBatchFromLastDays(
      this.analysisConfig.BATCH_SIZE,
      skip,
      startDate,
    );
  }

  private async findProfitableLogsFromLastDays(): Promise<MarketLog[]> {
    const startDate = this.getStartDate();
    return await this.marketLogFetcherService.findProfitableLogsFromLastDays(
      startDate,
    );
  }

  private async processLogsBatch(logs: MarketLog[]): Promise<MarketLog[]> {
    const profitableLogs: MarketLog[] = [];

    for (const log of logs) {
      const processedLog = await this.processSingleLog(log);
      if (processedLog) {
        profitableLogs.push(processedLog);
      }
    }

    return profitableLogs;
  }

  private async processSingleLog(log: MarketLog): Promise<MarketLog | null> {
    this.logger.log(`Analyzing log: ${log.from} ${log.createdAt}`);

    const logsInTimeWindow = await this.findLogsInTimeWindow(log);
    this.logTimeWindowResults(log, logsInTimeWindow);

    if (logsInTimeWindow.length === 0) {
      this.logger.debug(
        `No logs found in time window for asset=${log.from}, createdAt=${log.createdAt}`,
      );
      return null;
    }

    const { maxPriceChange, timeToReach } = this.calculateMaxPriceChange(
      log,
      logsInTimeWindow,
    );
    const isProfitable = this.isLogProfitable(maxPriceChange);

    await this.updateLogProfitability(
      log,
      isProfitable,
      maxPriceChange,
      timeToReach,
    );

    this.logger.debug(
      `Log checked: asset=${log.from}, maxPriceChange=${maxPriceChange.toFixed(2)}% (${maxPriceChange > 0 ? 'BUY' : 'SELL'}), timeToReach=${this.formatTimeToReach(timeToReach)}`,
    );

    return isProfitable
      ? this.createProfitableLog(log, maxPriceChange, timeToReach)
      : null;
  }

  private async findLogsInTimeWindow(log: MarketLog): Promise<MarketLog[]> {
    return await this.marketLogFetcherService.findLogsByAssetAndTimeWindow(
      log.from,
      log.createdAt,
      this.analysisConfig.MAX_HOURS_TO_CHECK,
    );
  }

  private logTimeWindowResults(
    log: MarketLog,
    logsInTimeWindow: MarketLog[],
  ): void {
    this.logger.log(
      `Found ${logsInTimeWindow.length} logs in time window for asset=${log.from}, createdAt=${log.createdAt}`,
    );
  }

  private calculateMaxPriceChange(
    log: MarketLog,
    futureLogs: MarketLog[],
  ): { maxPriceChange: number; timeToReach: number } {
    let maxPriceChange = 0;
    let timeToReach = 0;

    for (const futureLog of futureLogs) {
      const priceChange = this.calcUtils.calcPercentDiffBetweenPrices(
        log.currentPrice,
        futureLog.currentPrice,
      );

      if (Math.abs(priceChange) > Math.abs(maxPriceChange)) {
        maxPriceChange = priceChange;
        timeToReach = this.calculateTimeDifference(
          log.createdAt,
          futureLog.createdAt,
        );
      }
    }

    return { maxPriceChange, timeToReach };
  }

  private calculateTimeDifference(startTime: Date, endTime: Date): number {
    const diffInMs = endTime.getTime() - startTime.getTime();
    return diffInMs / (1000 * 60 * 60); // Convert to hours
  }

  private formatTimeToReach(timeInHours: number): string {
    if (timeInHours < 1) {
      const minutes = Math.round(timeInHours * 60);
      return `${minutes} minutes`;
    } else {
      const hours = Math.round(timeInHours);
      return `${hours} hours`;
    }
  }

  private isLogProfitable(maxPriceChange: number): boolean {
    return (
      Math.abs(maxPriceChange) >= this.analysisConfig.PROFIT_THRESHOLD_PERCENT
    );
  }

  private async updateLogProfitability(
    log: MarketLog,
    isProfitable: boolean,
    maxPriceChange: number,
    timeToReach: number,
  ): Promise<void> {
    await this.marketLogCreatorService.updateLogProfitability(
      log._id.toString(),
      isProfitable,
      maxPriceChange,
      new Date(),
      this.formatTimeToReach(timeToReach),
    );
  }

  private createProfitableLog(
    log: MarketLog,
    maxPriceChange: number,
    timeToReach: number,
  ): MarketLog {
    return {
      ...log.toObject(),
      wasProfitable: true,
      maxPriceChangePercent: maxPriceChange,
      profitabilityCheckedAt: new Date(),
      timeToReach: this.formatTimeToReach(timeToReach),
    } as MarketLog;
  }

  private selectBestLogsPerAsset(logs: MarketLog[]): Map<string, MarketLog> {
    const bestLogsPerAsset = new Map<string, MarketLog>();

    for (const log of logs) {
      const existingLog = bestLogsPerAsset.get(log.from);
      if (
        !existingLog ||
        log.maxPriceChangePercent > existingLog.maxPriceChangePercent
      ) {
        bestLogsPerAsset.set(log.from, log);
      }
    }

    return bestLogsPerAsset;
  }

  private sortLogsByProfitability(
    logsMap: Map<string, MarketLog>,
  ): MarketLog[] {
    return Array.from(logsMap.values()).sort(
      (a, b) => b.maxPriceChangePercent - a.maxPriceChangePercent,
    );
  }

  private logAnalysisResults(logs: MarketLog[]): void {
    this.logger.log(
      `Analysis complete. Finding best profitable logs per asset for the last ${this.analysisConfig.ANALYSIS_DAYS_BACK} days...`,
    );
    this.logger.log(
      `Found ${logs.length} best profitable logs per asset from the last ${this.analysisConfig.ANALYSIS_DAYS_BACK} days.`,
    );
    this.logger.log('Best profitable logs by asset:');

    logs.forEach((log, index) => {
      const timeInfo = (log as any).timeToReach
        ? ` (reached in ${(log as any).timeToReach})`
        : '';
      const direction = log.maxPriceChangePercent > 0 ? 'BUY' : 'SELL';
      this.logger.log(
        `${index + 1}. ${log.from}: ${direction} ${Math.abs(log.maxPriceChangePercent).toFixed(2)}%${timeInfo} at ${log.createdAt}`,
      );
    });
  }

  private getStartDate(): Date {
    return new Date(
      Date.now() - this.analysisConfig.ANALYSIS_DAYS_BACK * 24 * 60 * 60 * 1000,
    );
  }
}
