import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { Queue } from 'bullmq';
import { JOBS, JOB_OPTIONS } from 'src/common/constants/jobs.constants';
import { SQS_QUEUES } from 'src/common/constants/messaging.constants';

@Injectable()
export class ProfitableMarketLogsAnalysisConsumerService {
  private readonly logger = new Logger(
    ProfitableMarketLogsAnalysisConsumerService.name,
  );

  constructor(
    @InjectQueue(JOBS.PROFITABLE_MARKET_LOGS_ANALYSIS_PROCESSOR)
    private readonly profitableMarketLogsAnalysisQueue: Queue,
  ) {}

  @SqsMessageHandler(SQS_QUEUES.PROFITABLE_MARKET_LOGS_ANALYSIS)
  async handle(message: any): Promise<void> {
    try {
      const body = JSON.parse(message.Body);

      let jobData;
      if (body.Message) {
        jobData = JSON.parse(body.Message);
      } else {
        jobData = body;
      }

      if (jobData.expiresAt) {
        const expirationTime = new Date(jobData.expiresAt);
        const now = new Date();

        if (now > expirationTime) {
          this.logger.warn(
            `⏰ Message expired at ${jobData.expiresAt}, skipping processing`,
          );
          return;
        }
      }

      const jobId = `profitable-market-logs-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await this.profitableMarketLogsAnalysisQueue.add(
        JOBS.PROFITABLE_MARKET_LOGS_ANALYSIS_PROCESSOR,
        jobData,
        {
          ...JOB_OPTIONS,
          jobId: jobId,
        },
      );

      this.logger.log(
        `✅ Profitable market logs analysis queued for processing: ${jobId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error processing profitable market logs analysis: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
