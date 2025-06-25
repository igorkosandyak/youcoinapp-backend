import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from './cache';
import {
  validationSchema,
  validationOptions,
} from './config/validation.schema';
import { IntegrationsModule } from './integrations/integrations.module';
import { CommonModule } from './common/common.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { TradingModule } from './trading/trading.module';

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
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
    CacheModule,
    IntegrationsModule,
    CommonModule,
    InfrastructureModule,
    TradingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
