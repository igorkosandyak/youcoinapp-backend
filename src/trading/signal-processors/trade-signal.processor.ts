import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JOBS } from 'src/common/constants/jobs.constants';
import { TradeSignalJobDataDto } from 'src/common/models/dtos/trade-signal-job-data.dto';

@Processor(JOBS.TRADE_SIGNAL_PROCESSOR)
export class TradeSignalProcessor extends WorkerHost {
  private readonly logger = new Logger(TradeSignalProcessor.name);

  async process(job: Job<TradeSignalJobDataDto>): Promise<void> {
    this.logger.log(
      `Processing trade signal job ${job.id}: ${JSON.stringify(job.data)}`,
    );

    try {
      const { signal, receivedAt } = job.data;

      // Validate signal data
      if (!signal.pair || !signal.price || !signal.action) {
        throw new Error('Invalid signal data: missing required fields');
      }

      // Log the signal details
      this.logger.log(`Trade Signal Details:
        Pair: ${signal.pair}
        Price: ${signal.price}
        Action: ${signal.action}
        Received: ${receivedAt}
        Job ID: ${job.id}
      `);

      // TODO: Add your complex trading logic here
      // Examples:
      // - Validate against user subscriptions
      // - Check market conditions
      // - Execute trades via exchange APIs
      // - Send notifications
      // - Update user portfolios
      // - Log trading activities

      // Simulate processing time
      await this.simulateProcessing(signal);

      this.logger.log(`Successfully processed trade signal job ${job.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to process trade signal job ${job.id}: ${error.message}`,
        error.stack,
      );

      // Update job progress for monitoring
      await job.updateProgress(100);

      // Re-throw to trigger retry mechanism
      throw error;
    }
  }

  private async simulateProcessing(signal: any): Promise<void> {
    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate potential processing steps
    this.logger.log(
      `Processing ${signal.action} order for ${signal.pair} at ${signal.price}`,
    );

    // Add more complex logic here as needed
  }

  async onCompleted(job: Job<TradeSignalJobDataDto>): Promise<void> {
    this.logger.log(`Trade signal job ${job.id} completed successfully`);
  }

  async onFailed(job: Job<TradeSignalJobDataDto>, err: Error): Promise<void> {
    this.logger.error(
      `Trade signal job ${job.id} failed: ${err.message}`,
      err.stack,
    );
  }
}
