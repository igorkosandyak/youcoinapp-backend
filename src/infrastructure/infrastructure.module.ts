import { Module } from '@nestjs/common';
import { SnsPublisherService } from './sns-publisher.service';
import { ConfigService } from '@nestjs/config';
import { SqsModule } from '@ssut/nestjs-sqs';
import { SQS_QUEUES } from 'src/common/constants/messaging.constants';

@Module({
  imports: [
    SqsModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        consumers: [
          {
            name: SQS_QUEUES.TRADE_SIGNALS,
            queueUrl: config.get('AWS_SQS_TRADE_SIGNALS_URL'),
            region: config.get('AWS_REGION'),
            suppressFifoWarning: true,
          },
          {
            name: SQS_QUEUES.MARKET_LOG_COLLECTION,
            queueUrl: config.get('AWS_SQS_MARKET_LOG_COLLECTION_URL'),
            region: config.get('AWS_REGION'),
            suppressFifoWarning: true,
          },
          {
            name: SQS_QUEUES.PROFITABLE_MARKET_LOGS_ANALYSIS,
            queueUrl: config.get('AWS_SQS_MARKET_LOG_ANALYSIS_URL'),
            region: config.get('AWS_REGION'),
            suppressFifoWarning: true,
          },
        ],
        producers: [],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SnsPublisherService],
  exports: [SnsPublisherService],
})
export class InfrastructureModule {}
