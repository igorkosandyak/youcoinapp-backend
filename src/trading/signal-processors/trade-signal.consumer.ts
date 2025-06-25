import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SQS_QUEUES } from 'src/common/constants';
import { JOB_OPTIONS, JOBS } from 'src/common/constants/jobs.constants';
import { TradeSignalJobDataDto } from 'src/common/models/dtos/trade-signal-job-data.dto';

@Injectable()
export class TradingSignalConsumerService {
  private readonly logger = new Logger(TradingSignalConsumerService.name);

  constructor(
    @InjectQueue(JOBS.TRADE_SIGNAL_PROCESSOR)
    private readonly tradeSignalQueue: Queue,
  ) {}

  @SqsMessageHandler(SQS_QUEUES.TRADE_SIGNALS)
  async handle(message: any): Promise<void> {
    try {
      const body = JSON.parse(message.Body);
      this.logger.log(`Received trade signal: ${JSON.stringify(body)}`);

      const jobId = `trade-signal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const jobData: TradeSignalJobDataDto = {
        signal: JSON.parse(body.Message),
        receivedAt: new Date().toISOString(),
      };
      await this.tradeSignalQueue.add(JOBS.TRADE_SIGNAL_PROCESSOR, jobData, {
        ...JOB_OPTIONS,
        jobId: jobId,
      });

      this.logger.log(`Trade signal queued for processing: ${jobId}`);
    } catch (error) {
      this.logger.error(
        `Error processing trade signal: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
