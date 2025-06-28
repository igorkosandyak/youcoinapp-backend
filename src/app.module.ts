import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from './cache';
import { DatabaseModule } from './database/database.module';
import {
  validationSchema,
  validationOptions,
} from './config/validation.schema';
import { IntegrationsModule } from './integrations/integrations.module';
import { CommonModule } from './common/common.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { TradingModule } from './trading/trading.module';
import { JOB_OPTIONS } from './common/constants';
import { AccountsModule } from './accounts/accounts.module';
import { LearningModule } from './learning/learning.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.development', '.env'],
      isGlobal: true,
      validationSchema,
      validationOptions,
    }),
    BullModule.forRoot({
      connection: {
        host:
          process.env.BULL_REDIS_HOST || process.env.REDIS_HOST || 'localhost',
        port:
          parseInt(process.env.BULL_REDIS_PORT) ||
          parseInt(process.env.REDIS_PORT) ||
          6379,
        password: process.env.BULL_REDIS_PASSWORD || process.env.REDIS_PASSWORD,
        db: parseInt(process.env.BULL_REDIS_DB) || 1, // Use different DB for Bull MQ
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        family: 4,
      },
      defaultJobOptions: JOB_OPTIONS,
    }),
    DatabaseModule,
    CacheModule,
    IntegrationsModule,
    CommonModule,
    InfrastructureModule,
    TradingModule,
    AccountsModule,
    LearningModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
