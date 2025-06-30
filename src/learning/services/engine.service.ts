import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProfitableMarketLogsAnalysisJobDataDto } from 'src/common/models/dtos/profitable-market-logs-analysis-job-data.dto';
import { SnsPublisherService } from 'src/infrastructure/sns-publisher.service';
import { SNS_TOPICS } from '../../common/constants/messaging.constants';
import { LabelingService } from './labeling.service';

@Injectable()
export class EngineService implements OnModuleInit {
  private readonly logger = new Logger(EngineService.name);

  constructor(
    private readonly labelingService: LabelingService,
    private readonly snsPublisher: SnsPublisherService,
  ) {}

  async onModuleInit(): Promise<void> {}

  @Cron('0 3 * * *', { timeZone: 'UTC' })
  async triggerDailyAnalysis(): Promise<void> {
    try {
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
}
