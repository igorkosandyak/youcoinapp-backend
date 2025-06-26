import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { JOBS } from 'src/common/constants/jobs.constants';
import { TradeSignalJobDataDto } from 'src/common/models/dtos/trade-signal-job-data.dto';
import { MarketLogFetcherService } from '../market-logs/services/market-log-fetcher.service';

@Processor(JOBS.TRADE_SIGNAL_PROCESSOR)
export class TradeSignalProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(TradeSignalProcessor.name);

  constructor(
    private readonly marketLogFetcherService: MarketLogFetcherService,
  ) {
    super();
  }

  async onModuleInit() {}

  async process(job: Job<TradeSignalJobDataDto>): Promise<void> {
    try {
      const { signal } = job.data;

      if (!signal.pair || !signal.price || !signal.action) {
        throw new Error('Invalid signal data: missing required fields');
      }
      await this.marketLogFetcherService.fetchForSymbol(signal.pair);
    } catch (error) {
      this.logger.error(
        `❌ PROCESSOR: Failed to process trade signal job ${job.id}: ${error.message}`,
        error.stack,
      );

      await job.updateProgress(100);
      throw error;
    }
  }
}
