import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { TradingSignalConsumerService } from './signal-processors/trade-signal.consumer';
import { TradeSignalProcessor } from './signal-processors/trade-signal.processor';
import { JOBS, QUEUE_CONFIGS } from 'src/common/constants/jobs.constants';
import { MarketLogFetcherService } from './market-logs/services/market-log-fetcher.service';
import { SpotEngineService } from './engine/spot-engine.service';
import { AccountsModule } from 'src/accounts/accounts.module';
import { IntegrationsModule } from 'src/integrations/integrations.module';
import {
  CommonModule,
  MarketLog,
  MarketLogSchema,
} from 'src/common/common.module';
import { MarketLogCollectionConsumerService } from './market-log-processors/market-log-collection.consumer';
import { MarketLogCollectionProcessor } from './market-log-processors/market-log-collection.processor';
import { IndicatorsService } from './market-logs/services/indicators.service';
import { TimeUtils } from 'src/common/utils/time-utils.service';
import { MarketLogRepository } from './market-logs/repositories/market-log.repository';
import { MarketLogCreatorService } from './market-logs/services/market-log-creator.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { MarketLogRateLimiterService } from './market-logs/services/market-log-rate-limiter.service';
import { MarketLogStatusService } from './market-logs/services/market-log-status.service';
import { MarketLogStatusController } from './controllers/market-log-status.controller';
import { LearningModule } from 'src/learning/learning.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: MarketLog.name, schema: MarketLogSchema },
    ]),
    CommonModule,
    AccountsModule,
    IntegrationsModule,
    InfrastructureModule,
    BullModule.registerQueue({
      name: JOBS.TRADE_SIGNAL_PROCESSOR,
      ...QUEUE_CONFIGS[JOBS.TRADE_SIGNAL_PROCESSOR],
    }),
    BullModule.registerQueue({
      name: JOBS.MARKET_LOG_COLLECTION_PROCESSOR,
      ...QUEUE_CONFIGS[JOBS.MARKET_LOG_COLLECTION_PROCESSOR],
    }),
    forwardRef(() => LearningModule),
  ],
  controllers: [MarketLogStatusController],
  providers: [
    TradingSignalConsumerService,
    TradeSignalProcessor,
    MarketLogFetcherService,
    SpotEngineService,
    MarketLogCollectionConsumerService,
    MarketLogCollectionProcessor,
    IndicatorsService,
    TimeUtils,
    MarketLogRepository,
    MarketLogCreatorService,
    MarketLogRateLimiterService,
    MarketLogStatusService,
  ],
  exports: [
    MarketLogFetcherService,
    MarketLogCreatorService,
    TimeUtils,
    MarketLogRepository,
    IndicatorsService,
  ],
})
export class TradingModule {}
