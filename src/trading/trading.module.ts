import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { TradingSignalConsumerService } from './signal-processors/trade-signal.consumer';
import { TradeSignalProcessor } from './signal-processors/trade-signal.processor';
import { JOB_OPTIONS, JOBS } from 'src/common/constants/jobs.constants';

@Module({
  imports: [
    InfrastructureModule,
    BullModule.registerQueue({
      name: JOBS.TRADE_SIGNAL_PROCESSOR,
      defaultJobOptions: JOB_OPTIONS,
    }),
  ],
  providers: [TradingSignalConsumerService, TradeSignalProcessor],
})
export class TradingModule {}
