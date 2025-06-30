/* eslint-disable prettier/prettier */
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { Queue } from 'bullmq';
import { SQS_QUEUES } from 'src/common/constants';
import { JOB_OPTIONS, JOBS } from 'src/common/constants/jobs.constants';
import { TradeSignalJobDataDto } from 'src/common/models/dtos/trade-signal-job-data.dto';

@Injectable()
export class TradingSignalConsumerService implements OnModuleInit {
  private readonly logger = new Logger(TradingSignalConsumerService.name);

  constructor(
    @InjectQueue(JOBS.TRADE_SIGNAL_PROCESSOR)
    private readonly tradeSignalQueue: Queue,
  ) {}

  async onModuleInit() {}

  @SqsMessageHandler(SQS_QUEUES.TRADE_SIGNALS)
  async handle(message: any): Promise<void> {
    try {
      this.logger.log(`🔍 SQS Message received: ${JSON.stringify(message)}`);

      const body = JSON.parse(message.Body);
      this.logger.log(`📦 Parsed message body: ${JSON.stringify(body)}`);

      let signalData;
      if (body.Message) {
        signalData = JSON.parse(body.Message);
        this.logger.log(`📨 SNS message extracted: ${JSON.stringify(signalData)}`);
      } else {
        signalData = body;
        this.logger.log(`📨 Direct SQS message: ${JSON.stringify(signalData)}`);
      }

      // Check if message has expired (works with BaseMessageDto)
      if (signalData.expiresAt) {
        const expirationTime = new Date(signalData.expiresAt);
        const now = new Date();
        if (now > expirationTime) {
          this.logger.warn(`⏰ Message expired at ${signalData.expiresAt}, skipping processing`);
          return;
        }

        const remainingTime = expirationTime.getTime() - now.getTime();
        const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
        const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

        this.logger.log(`⏰ Message expires in ${remainingMinutes}m ${remainingSeconds}s`);
      }

      const jobId = `trade-signal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const jobData = new TradeSignalJobDataDto(signalData);

      this.logger.log(`🚀 Adding job to BullMQ queue: ${jobId}`);
      this.logger.log(`📋 Job data: ${JSON.stringify(jobData)}`);

      await this.tradeSignalQueue.add(JOBS.TRADE_SIGNAL_PROCESSOR, jobData, {
        ...JOB_OPTIONS,
        jobId: jobId,
      });

      this.logger.log(`✅ Trade signal queued for processing: ${jobId}`);
    } catch (error) {
      this.logger.error(`❌ Error processing trade signal: ${error.message}`, error.stack);
      throw error;
    }
  }
}
