import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JOBS, JOB_OPTIONS } from 'src/common/constants/jobs.constants';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { SQS_QUEUES } from 'src/common/constants/messaging.constants';

@Injectable()
export class ProfitableMarketLogsAnalysisConsumerService {
  private readonly logger = new Logger(ProfitableMarketLogsAnalysisConsumerService.name);

  constructor(
    @InjectQueue(JOBS.PROFITABLE_MARKET_LOGS_ANALYSIS_PROCESSOR)
    private readonly profitableMarketLogsAnalysisQueue: Queue,
  ) {}

  @SqsMessageHandler(SQS_QUEUES.PROFITABLE_MARKET_LOGS_ANALYSIS)
  async handle(message: any): Promise<void> {
    try {
      this.logger.log(`🔍 SQS Message received for profitable market logs analysis: ${JSON.stringify(message)}`);

      const body = JSON.parse(message.Body);
      this.logger.log(`📦 Parsed message body: ${JSON.stringify(body)}`);

      let jobData;
      if (body.Message) {
        jobData = JSON.parse(body.Message);
        this.logger.log(`📨 SNS message extracted: ${JSON.stringify(jobData)}`);
      } else {
        jobData = body;
        this.logger.log(`📨 Direct SQS message: ${JSON.stringify(jobData)}`);
      }

      const jobId = `profitable-market-logs-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      this.logger.log(`🚀 Adding profitable market logs analysis job to BullMQ queue: ${jobId}`);
      this.logger.log(`📋 Job data: ${JSON.stringify(jobData)}`);

      await this.profitableMarketLogsAnalysisQueue.add(JOBS.PROFITABLE_MARKET_LOGS_ANALYSIS_PROCESSOR, jobData, {
        ...JOB_OPTIONS,
        jobId: jobId,
      });

      this.logger.log(`✅ Profitable market logs analysis queued for processing: ${jobId}`);
    } catch (error) {
      this.logger.error(`❌ Error processing profitable market logs analysis: ${error.message}`, error.stack);
      throw error;
    }
  }
}
