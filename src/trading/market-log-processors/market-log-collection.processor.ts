import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { JOBS } from 'src/common/constants/jobs.constants';
import { MarketLogFetcherService } from '../market-logs/services/market-log-fetcher.service';
import { MarketLogCollectionJobDataDto } from 'src/common/models/dtos/market-log-collection-job-data.dto';
import { ExchangesFactory } from 'src/integrations/services/external-exchanges/exchanges.factory';
import { MarketLogRateLimiterService } from '../market-logs/services/market-log-rate-limiter.service';

@Processor(JOBS.MARKET_LOG_COLLECTION_PROCESSOR, { concurrency: 10 })
export class MarketLogCollectionProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(MarketLogCollectionProcessor.name);

  constructor(
    private readonly marketLogFetcherService: MarketLogFetcherService,
    private readonly exchangesFactory: ExchangesFactory,
    private readonly rateLimiter: MarketLogRateLimiterService,
  ) {
    super();
  }

  async onModuleInit() {}

  async process(job: Job<MarketLogCollectionJobDataDto>): Promise<void> {
    try {
      await job.updateProgress(10);

      const { exchangeDetails } = job.data;

      // Re-initialize the exchange service since it gets serialized when sent through SNS/SQS
      const exchangeService = this.exchangesFactory.getFetcher(exchangeDetails);

      await this.marketLogFetcherService.fetchForExchange(exchangeDetails, exchangeService);

      // Update the last run time after successful processing
      await this.rateLimiter.updateLastRunTime(exchangeDetails);

      await job.updateProgress(90);

      this.logger.log(`✅ [${job.id}] Market log collection completed for exchange: ${exchangeDetails.name}`);
      await job.updateProgress(100);
    } catch (error) {
      this.logger.error(
        `❌ [${job.id}] PROCESSOR: Failed to process market log collection job: ${error.message}`,
        error.stack,
      );

      await job.updateProgress(100);
      throw error;
    }
  }
}
