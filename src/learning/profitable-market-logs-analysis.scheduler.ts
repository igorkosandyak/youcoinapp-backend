import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { SnsPublisherService } from 'src/infrastructure/sns-publisher.service';
import { SNS_TOPICS } from 'src/common/constants/messaging.constants';
import { ProfitableMarketLogsAnalysisJobDataDto } from 'src/common/models/dtos/profitable-market-logs-analysis-job-data.dto';

@Injectable()
export class ProfitableMarketLogsAnalysisSchedulerService
  implements OnModuleInit
{
  private readonly logger = new Logger(
    ProfitableMarketLogsAnalysisSchedulerService.name,
  );

  constructor(private readonly snsPublisher: SnsPublisherService) {}

  async onModuleInit() {
    this.logger.log('Profitable Market Logs Analysis Scheduler initialized');
    await this.triggerDailyAnalysis();
  }

  @Interval(24 * 60 * 60 * 1000) // Run every 24 hours
  async triggerDailyAnalysis(): Promise<void> {
    try {
      this.logger.log('🔄 Triggering daily profitable market logs analysis...');

      const jobData = new ProfitableMarketLogsAnalysisJobDataDto('daily');

      await this.snsPublisher.publish(
        SNS_TOPICS.PROFITABLE_MARKET_LOGS_ANALYSIS,
        jobData,
      );

      this.logger.log(
        '✅ Daily profitable market logs analysis triggered successfully',
      );
    } catch (error) {
      this.logger.error(
        '❌ Error triggering daily profitable market logs analysis:',
        error,
      );
    }
  }

  async triggerOnDemandAnalysis(
    startDate?: string,
    endDate?: string,
  ): Promise<void> {
    try {
      this.logger.log(
        '🔄 Triggering on-demand profitable market logs analysis...',
      );

      const jobData = new ProfitableMarketLogsAnalysisJobDataDto(
        'on-demand',
        startDate,
        endDate,
      );

      await this.snsPublisher.publish(
        SNS_TOPICS.PROFITABLE_MARKET_LOGS_ANALYSIS,
        jobData,
      );

      this.logger.log(
        '✅ On-demand profitable market logs analysis triggered successfully',
      );
    } catch (error) {
      this.logger.error(
        '❌ Error triggering on-demand profitable market logs analysis:',
        error,
      );
      throw error;
    }
  }
}
