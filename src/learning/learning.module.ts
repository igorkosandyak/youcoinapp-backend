import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import {
  CommonModule,
  MarketLog,
  MarketLogSchema,
} from 'src/common/common.module';
import { JOBS, QUEUE_CONFIGS } from 'src/common/constants/jobs.constants';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { TradingModule } from 'src/trading/trading.module';
import { ProfitableMarketLogsAnalysisController } from './controllers/profitable-market-logs-analysis.controller';
import { ProfitableMarketLogsAnalysisConsumerService } from './profitable-market-logs-analysis.consumer';
import { ProfitableMarketLogsAnalysisProcessor } from './profitable-market-logs-analysis.processor';
import { EngineService } from './services/engine.service';
import { LabelingService } from './services/labeling.service';
import { VectorEncoderService } from './services/vector-encoder.service';

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
  ],
  exports: [EngineService, LabelingService, VectorEncoderService],
})
export class LearningModule {}
