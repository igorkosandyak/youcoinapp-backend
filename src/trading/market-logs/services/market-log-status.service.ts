import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MarketLogRateLimiterService } from './market-log-rate-limiter.service';
import { ExchangeSettingsService } from 'src/accounts/services/exchange-settings.service';
import { ExchangeDetails } from 'src/common/models/entities/exchange-details.entity';
import {
  ExchangeStatusDto,
  CollectionStatsDto,
  ExchangeStatusResponseDto,
  ClearRateLimitResponseDto,
} from '../../../common/models/dtos/market-log-status.dto';

@Injectable()
export class MarketLogStatusService {
  private readonly logger = new Logger(MarketLogStatusService.name);

  constructor(
    private readonly rateLimiter: MarketLogRateLimiterService,
    private readonly exchangeService: ExchangeSettingsService,
  ) {}

  async getCollectionStats(): Promise<CollectionStatsDto> {
    try {
      this.logger.debug('Fetching collection statistics for all exchanges');

      const stats = await this.rateLimiter.getCollectionStats();
      const exchanges = await this.exchangeService.findActiveSystemExchanges();

      const exchangeStats = await Promise.all(
        exchanges.map(async (exchange) => {
          return await this.getExchangeStatusDto(exchange);
        }),
      );

      const result: CollectionStatsDto = {
        collectionInterval: stats.collectionInterval,
        collectionIntervalMs: stats.collectionIntervalMs,
        exchanges: exchangeStats,
        timestamp: new Date().toISOString(),
      };

      this.logger.debug(
        `Retrieved stats for ${exchangeStats.length} exchanges`,
      );
      return result;
    } catch (error) {
      this.logger.error('Error getting collection stats:', error);
      throw error;
    }
  }

  async getExchangeStatus(
    exchangeName: string,
  ): Promise<ExchangeStatusResponseDto> {
    try {
      this.logger.debug(`Fetching status for exchange: ${exchangeName}`);

      const exchange = await this.findExchangeByName(exchangeName);
      const statusDto = await this.getExchangeStatusDto(exchange);

      const result: ExchangeStatusResponseDto = {
        ...statusDto,
        timestamp: new Date().toISOString(),
      };

      this.logger.debug(`Retrieved status for ${exchangeName}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Error getting status for exchange ${exchangeName}:`,
        error,
      );
      throw error;
    }
  }

  async clearRateLimit(
    exchangeName: string,
  ): Promise<ClearRateLimitResponseDto> {
    try {
      this.logger.log(`Clearing rate limit for exchange: ${exchangeName}`);

      await this.findExchangeByName(exchangeName);

      await this.rateLimiter.clearRateLimit(exchangeName);

      const result: ClearRateLimitResponseDto = {
        message: `Rate limit cleared for ${exchangeName}`,
        timestamp: new Date().toISOString(),
      };

      this.logger.log(`Successfully cleared rate limit for ${exchangeName}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Error clearing rate limit for ${exchangeName}:`,
        error,
      );
      throw error;
    }
  }

  async getAllExchangeStatuses(): Promise<ExchangeStatusDto[]> {
    try {
      this.logger.debug('Fetching status for all exchanges');

      const exchanges = await this.exchangeService.findActiveSystemExchanges();

      const statuses = await Promise.all(
        exchanges.map(async (exchange) => {
          return await this.getExchangeStatusDto(exchange);
        }),
      );

      this.logger.debug(`Retrieved statuses for ${statuses.length} exchanges`);
      return statuses;
    } catch (error) {
      this.logger.error('Error getting all exchange statuses:', error);
      throw error;
    }
  }

  private async findExchangeByName(
    exchangeName: string,
  ): Promise<ExchangeDetails> {
    const exchanges = await this.exchangeService.findActiveSystemExchanges();
    const exchange = exchanges.find(
      (e) => e.name.toLowerCase() === exchangeName.toLowerCase(),
    );

    if (!exchange) {
      this.logger.warn(`Exchange not found: ${exchangeName}`);
      throw new NotFoundException(`Exchange '${exchangeName}' not found`);
    }

    return exchange;
  }

  private async getExchangeStatusDto(
    exchange: ExchangeDetails,
  ): Promise<ExchangeStatusDto> {
    const timeUntilNext =
      await this.rateLimiter.getTimeUntilNextCollection(exchange);

    return {
      name: exchange.name,
      timeUntilNextCollection: timeUntilNext,
      timeUntilNextCollectionMinutes: Math.ceil(timeUntilNext / 1000 / 60),
      canCollectNow: timeUntilNext === 0,
    };
  }
}
