/* eslint-disable prettier/prettier */
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { Queue } from 'bullmq';
import { JOBS, JOB_OPTIONS } from 'src/common/constants/jobs.constants';
import { SQS_QUEUES } from 'src/common/constants/messaging.constants';

@Injectable()
export class MarketLogCollectionConsumerService {
  private readonly logger = new Logger(MarketLogCollectionConsumerService.name);

  constructor(
    @InjectQueue(JOBS.MARKET_LOG_COLLECTION_PROCESSOR)
    private readonly marketLogCollectionQueue: Queue,
  ) {}

  @SqsMessageHandler(SQS_QUEUES.MARKET_LOG_COLLECTION)
  async handle(message: any): Promise<void> {
    try {
      const body = JSON.parse(message.Body);

      let jobData;
      if (body.Message) {
        jobData = JSON.parse(body.Message);
      } else {
        jobData = body;
      }

      // Check if message has expired (works with BaseMessageDto)
      if (jobData.expiresAt) {
        const expirationTime = new Date(jobData.expiresAt);
        const now = new Date();
        if (now > expirationTime) {
          this.logger.warn(`⏰ Message expired at ${jobData.expiresAt}, skipping processing`);
          return;
        }

        const remainingTime = expirationTime.getTime() - now.getTime();
        const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
        const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

        this.logger.log(`⏰ Message expires in ${remainingMinutes}m ${remainingSeconds}s`);
      }

      const jobId = `market-log-collection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await this.marketLogCollectionQueue.add(JOBS.MARKET_LOG_COLLECTION_PROCESSOR, jobData, {
        ...JOB_OPTIONS,
        jobId: jobId,
      });

      this.logger.log(`✅ Market log collection queued for processing: ${jobId}`);
    } catch (error) {
      this.logger.error(`❌ Error processing market log collection: ${error.message}`, error.stack);
      throw error;
    }
  }
}
