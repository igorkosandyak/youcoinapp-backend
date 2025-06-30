import { Module } from '@nestjs/common';
import { TradingviewController } from './controllers/tradingview.controller';
import { TradingviewService } from './services/tradingview.service';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { CommonModule } from 'src/common/common.module';
import { ExchangesFactory } from './services/external-exchanges/exchanges.factory';
import { BinanceFetcherService } from './services/external-exchanges/impl/binance-fetcher.service';
import { BybitFetcherService } from './services/external-exchanges/impl/bybit-fetcher.service';

@Module({
  imports: [InfrastructureModule, CommonModule],
  controllers: [TradingviewController],
  providers: [TradingviewService, ExchangesFactory, BinanceFetcherService, BybitFetcherService],
  exports: [ExchangesFactory, BinanceFetcherService, BybitFetcherService],
})
export class IntegrationsModule {}
