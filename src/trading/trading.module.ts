import { Module } from '@nestjs/common';
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
import { CalcUtils } from 'src/common/utils/calc-utils.service';
import { MarketLogRepository } from './market-logs/repositories/market-log.repository';
import { MarketLogCreatorService } from './market-logs/services/market-log-creator.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

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
  ],
  providers: [
    TradingSignalConsumerService,
    TradeSignalProcessor,
    MarketLogFetcherService,
    SpotEngineService,
    MarketLogCollectionConsumerService,
    MarketLogCollectionProcessor,
    IndicatorsService,
    CalcUtils,
    TimeUtils,
    MarketLogRepository,
    MarketLogCreatorService,
  ],
})
export class TradingModule {}
