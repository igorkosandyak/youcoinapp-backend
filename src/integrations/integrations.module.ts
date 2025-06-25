import { Module } from '@nestjs/common';
import { TradingviewController } from './controllers/tradingview.controller';
import { TradingviewService } from './services/tradingview.service';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  controllers: [TradingviewController],
  providers: [TradingviewService],
})
export class IntegrationsModule {}
