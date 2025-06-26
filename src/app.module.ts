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
        password: process.env.REDIS_PASSWORD,
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
