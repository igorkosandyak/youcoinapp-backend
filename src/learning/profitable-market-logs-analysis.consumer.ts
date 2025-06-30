import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JOBS, JOB_OPTIONS } from 'src/common/constants/jobs.constants';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
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
      this.logger.log(
        `SQS Message received for profitable market logs analysis: ${JSON.stringify(message)}`,
      );

      const body = JSON.parse(message.Body);
      this.logger.log(`Parsed message body: ${JSON.stringify(body)}`);

      let jobData;
      if (body.Message) {
        jobData = JSON.parse(body.Message);
        this.logger.log(`SNS message extracted: ${JSON.stringify(jobData)}`);
      } else {
        jobData = body;
        this.logger.log(`Direct SQS message: ${JSON.stringify(jobData)}`);
      }

      // Check if message has expired
      if (jobData.expiresAt) {
        const expirationTime = new Date(jobData.expiresAt);
        const now = new Date();
 if (now > expirationTime) {
          this.logger.warn(`Message
            `Message expired at ${jobData.expiresAt}, skipping processing`,
               return;
        }

       emainingTime = expirationTime.getTime() - now.getTime();
        const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
        const remainingSeconds = Math.floor((remainingTime %
          (remainingTime % (1000 * 60)) / 1000,ogger.log);
(`Message expires in ${re
          `Message expires in ${remainingMinutes}m ${remainingSeconds}s`,
        jobId = `profitable-market-logs-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      this.logger.log(`Adding profitable marke
        `Adding profitable market logs analysis job to BullMQ queue: ${jobId}`,
      (`Job data: ${JSON.stringify(jobData)}`);

      await this.profitableMarketLogsAnalysisQueue.add(JOBS.PROFITABLE_MARKET_L
        JOBS.PROFITABLE_MARKET_LOGS_ANALYSIS_PROCESSOR,
        jobData,
       S,
          jobId: jobId,
      });
  
      this.lo        },
      g(`Profitable market logs 
        `Profitable market logs analysis queued for processing: ${jobId}`,
      
      this.logger.error(`Error processing profit
        `Error processing profitable market logs analysis: ${error.message}`,
        error.stack,
        }
  }
}
