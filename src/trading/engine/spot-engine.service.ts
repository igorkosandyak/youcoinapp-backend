import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarketLogFetcherService } from '../market-logs/services/market-log-fetcher.service';
import { ExchangeSettingsService } from 'src/accounts/services/exchange-settings.service';
import { ExchangesFactory } from 'src/integrations/services/external-exchanges/exchanges.factory';
import { SnsPublisherService } from 'src/infrastructure/sns-publisher.service';
import { SNS_TOPICS } from 'src/common/constants';
import { MarketLogCollectionJobDataDto } from 'src/common/models/dtos/market-log-collection-job-data.dto';
import { MarketLogRateLimiterService } from '../market-logs/services/market-log-rate-limiter.service';
import { Interval } from '@nestjs/schedule';

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

  onModuleInit(): void {
    this.logger.log('✅ Spot trading system started');
    this.logger.log(
      `📊 Market log collection scheduled every ${this.collectionInterval} minutes`,
    );
  }

  @Interval(60000)
  async collectMarketLogs(): Promise<void> {
    try {
      const topicName = SNS_TOPICS.MARKET_LOG_COLLECTION;
      const exchanges = await this.exchangeService.findActiveSystemExchanges();

      this.logger.debug(
        `🔄 Checking ${exchanges.length} exchanges for market log collection`,
      );

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
