import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { JOBS, QUEUE_CONFIGS } from 'src/common/constants/jobs.constants';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { TradingModule } from 'src/trading/trading.module';
import {
  CommonModule,
  MarketLog,
  MarketLogSchema,
} from 'src/common/common.module';
import { EngineService } from './services/engine.service';
import { LabelingService } from './services/labeling.service';
import { VectorEncoderService } from './services/vector-encoder.service';
import { ProfitableMarketLogsAnalysisConsumerService } from './profitable-market-logs-analysis.consumer';
import { ProfitableMarketLogsAnalysisProcessor } from './profitable-market-logs-analysis.processor';
import { ProfitableMarketLogsAnalysisSchedulerService } from './profitable-market-logs-analysis.scheduler';
import { ProfitableMarketLogsAnalysisController } from './controllers/profitable-market-logs-analysis.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    InfrastructureModule,
    forwardRef(() => TradingModule),
    MongooseModule.forFeature([
      { name: MarketLog.name, schema: MarketLogSchema },
    ]),
    CommonModule,
    BullModule.registerQueue({
      name: JOBS.PROFITABLE_MARKET_LOGS_ANALYSIS_PROCESSOR,
      ...QUEUE_CONFIGS[JOBS.PROFITABLE_MARKET_LOGS_ANALYSIS_PROCESSOR],
    }),
  ],
  controllers: [ProfitableMarketLogsAnalysisController],
  providers: [
    EngineService,
    LabelingService,
    VectorEncoderService,
    ProfitableMarketLogsAnalysisConsumerService,
    ProfitableMarketLogsAnalysisProcessor,
    ProfitableMarketLogsAnalysisSchedulerService,
  ],
  exports: [EngineService, LabelingService, VectorEncoderService],
})
export class LearningModule {}
