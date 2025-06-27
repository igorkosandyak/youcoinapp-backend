import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { JOBS } from 'src/common/constants/jobs.constants';
import { ProfitableMarketLogsAnalysisJobDataDto } from 'src/common/models/dtos/profitable-market-logs-analysis-job-data.dto';
import { LabelingService } from './services/labeling.service';
import { ProfitableMarketLogCreatorService } from 'src/trading/market-logs/services/profitable-market-log-creator.service';

@Processor(JOBS.PROFITABLE_MARKET_LOGS_ANALYSIS_PROCESSOR, { concurrency: 5 })
export class ProfitableMarketLogsAnalysisProcessor
  extends WorkerHost
  implements OnModuleInit
{
  private readonly logger = new Logger(
    ProfitableMarketLogsAnalysisProcessor.name,
  );

  constructor(
    private readonly labelingService: LabelingService,
    private readonly profitableMarketLogCreatorService: ProfitableMarketLogCreatorService,
  ) {
    super();
  }

  async onModuleInit() {
    this.logger.log('Profitable Market Logs Analysis Processor initialized');
  }

  async process(
    job: Job<ProfitableMarketLogsAnalysisJobDataDto>,
  ): Promise<void> {
    try {
      await job.updateProgress(10);

      const { analysisType, startDate, endDate } = job.data;

      this.logger.log(
        `🔄 [${job.id}] Starting profitable market logs analysis: ${analysisType}`,
      );

      let bestProfitableLogs;

      if (analysisType === 'daily') {
        // Run daily analysis (last 24 hours)
        bestProfitableLogs =
          await this.labelingService.analyzeMarketLogsProfitability();
      } else if (analysisType === 'on-demand') {
        // Run custom date range analysis
        if (startDate && endDate) {
          this.logger.log(
            `📅 Custom date range analysis: ${startDate} to ${endDate}`,
          );
          // For now, we'll use the daily analysis, but this could be extended
          bestProfitableLogs =
            await this.labelingService.analyzeMarketLogsProfitability();
        } else {
          bestProfitableLogs =
            await this.labelingService.analyzeMarketLogsProfitability();
        }
      }

      await job.updateProgress(60);

      // Save profitable market logs to the new collection
      if (bestProfitableLogs && bestProfitableLogs.length > 0) {
        this.logger.log(
          `💾 [${job.id}] Saving ${bestProfitableLogs.length} profitable market logs to collection`,
        );

        await this.profitableMarketLogCreatorService.saveProfitableMarketLogs(
          bestProfitableLogs,
          analysisType,
        );

        this.logger.log(
          `✅ [${job.id}] Successfully saved profitable market logs to collection`,
        );
      }

      await job.updateProgress(80);

      this.logger.log(
        `✅ [${job.id}] Profitable market logs analysis completed. Found ${bestProfitableLogs.length} best profitable logs per asset.`,
      );

      // Log the top profitable opportunities
      if (bestProfitableLogs.length > 0) {
        this.logger.log('🏆 Top profitable opportunities:');
        bestProfitableLogs.slice(0, 10).forEach((log, index) => {
          const timeInfo = (log as any).timeToReach
            ? ` (reached in ${(log as any).timeToReach})`
            : '';
          this.logger.log(
            `${index + 1}. ${log.from}: ${log.maxPriceChangePercent.toFixed(2)}%${timeInfo} at ${log.createdAt}`,
          );
        });
      } else {
        this.logger.log(
          '📊 No profitable opportunities found in the analysis period.',
        );
      }

      await job.updateProgress(100);
    } catch (error) {
      this.logger.error(
        `❌ [${job.id}] PROCESSOR: Failed to process profitable market logs analysis job: ${error.message}`,
        error.stack,
      );

      await job.updateProgress(100);
      throw error;
    }
  }
}
