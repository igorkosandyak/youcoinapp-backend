import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { ExchangeSettingsService } from 'src/accounts/services/exchange-settings.service';
import { SNS_TOPICS } from 'src/common/constants';
import { MarketLogCollectionJobDataDto } from 'src/common/models/dtos/market-log-collection-job-data.dto';
import { SnsPublisherService } from 'src/infrastructure/sns-publisher.service';
import { ExchangesFactory } from 'src/integrations/services/external-exchanges/exchanges.factory';
import { MarketLogFetcherService } from '../market-logs/services/market-log-fetcher.service';
import { MarketLogRateLimiterService } from '../market-logs/services/market-log-rate-limiter.service';

@Injectable()
export class SpotEngineService implements OnModuleInit {
  private readonly logger: Logger = new Logger(SpotEngineService.name);
  private readonly collectionInterval: number;

  constructor(
    private readonly marketService: MarketLogFetcherService,
    private readonly exchangeService: ExchangeSettingsService,
    private readonly exchangesFactory: ExchangesFactory,
    private readonly snsPublisher: SnsPublisherService,
    private readonly rateLimiter: MarketLogRateLimiterService,
    private readonly configService: ConfigService,
  ) {
    this.collectionInterval = this.configService.get<number>(
      'MARKET_LOGS_COLLECTION_INTERVAL',
      3,
    );
  }

  onModuleInit(): void {}

  @Interval(60000)
  async collectMarketLogs(): Promise<void> {
    try {
      const topicName = SNS_TOPICS.MARKET_LOG_COLLECTION;
      const exchanges = await this.exchangeService.findActiveSystemExchanges();

      for (const exchangeDetails of exchanges) {
        const shouldSkip =
          await this.rateLimiter.shouldSkipCollection(exchangeDetails);

        if (shouldSkip) {
          continue;
        }

        const jobData = new MarketLogCollectionJobDataDto(exchangeDetails);
        await this.snsPublisher.publish(topicName, jobData);
        await this.rateLimiter.updateLastRunTime(exchangeDetails);

        this.logger.log(
          `📤 Published market log collection job for ${exchangeDetails.name}`,
        );
      }
    } catch (error) {
      this.logger.error('❌ Error in market log collection scheduler:', error);
    }
  }
}
