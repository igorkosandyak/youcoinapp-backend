import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MarketLogFetcherService } from '../market-logs/services/market-log-fetcher.service';
import { ExchangeSettingsService } from 'src/accounts/services/exchange-settings.service';
import { ExchangesFactory } from 'src/integrations/services/external-exchanges/exchanges.factory';
import { SnsPublisherService } from 'src/infrastructure/sns-publisher.service';
import { SNS_TOPICS } from 'src/common/constants';
import { MarketLogCollectionJobDataDto } from 'src/common/models/dtos/market-log-collection-job-data.dto';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class SpotEngineService implements OnModuleInit {
  private readonly logger: Logger = new Logger(SpotEngineService.name);

  constructor(
    private readonly marketService: MarketLogFetcherService,
    private readonly exchangeService: ExchangeSettingsService,
    private readonly exchangesFactory: ExchangesFactory,
    private readonly snsPublisher: SnsPublisherService,
  ) {}

  onModuleInit(): void {
    this.logger.log('✅ Spot trading system started');
  }

  @Interval(60000 * 3)
  async collectMarketLogs(): Promise<void> {
    const topicName = SNS_TOPICS.MARKET_LOG_COLLECTION;
    const exchanges = await this.exchangeService.findActiveSystemExchanges();

    for (const exchangeDetails of exchanges) {
      const jobData = new MarketLogCollectionJobDataDto(exchangeDetails);
      await this.snsPublisher.publish(topicName, jobData);
    }
  }
}
