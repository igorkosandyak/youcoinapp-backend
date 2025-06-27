import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from 'src/cache/cache.service';
import { ExchangeDetails } from 'src/common/models/entities/exchange-details.entity';

@Injectable()
export class MarketLogRateLimiterService {
  private readonly logger = new Logger(MarketLogRateLimiterService.name);
  private readonly collectionInterval: number;
  private readonly cachePrefix = 'market-logs:last-run';

  constructor(
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {
    this.collectionInterval = this.configService.get<number>(
      'MARKET_LOGS_COLLECTION_INTERVAL',
      3,
    );
    this.logger.log(
      `Market log collection rate limiter initialized with ${this.collectionInterval} minute interval`,
    );
  }

  /**
   * Check if market log collection should be skipped for the given exchange
   * @param exchangeDetails - The exchange details
   * @returns true if collection should be skipped, false if it should proceed
   */
  async shouldSkipCollection(
    exchangeDetails: ExchangeDetails,
  ): Promise<boolean> {
    try {
      const cacheKey = this.buildCacheKey(exchangeDetails.name);
      const lastRunTime = await this.cacheService.get<number>(cacheKey);

      if (!lastRunTime) {
        this.logger.debug(
          `No previous run found for ${exchangeDetails.name}, proceeding with collection`,
        );
        return false;
      }

      const now = Date.now();
      const timeSinceLastRun = now - lastRunTime;
      const intervalMs = this.collectionInterval * 60 * 1000; // Convert minutes to milliseconds

      if (timeSinceLastRun < intervalMs) {
        const remainingTime = Math.ceil(
          (intervalMs - timeSinceLastRun) / 1000 / 60,
        );
        this.logger.log(
          `⏰ Skipping market log collection for ${exchangeDetails.name}. Last run was ${Math.floor(
            timeSinceLastRun / 1000 / 60,
          )} minutes ago. Next collection in ${remainingTime} minutes.`,
        );
        return true;
      }

      this.logger.debug(
        `✅ Proceeding with market log collection for ${exchangeDetails.name}. Last run was ${Math.floor(
          timeSinceLastRun / 1000 / 60,
        )} minutes ago.`,
      );
      return false;
    } catch (error) {
      this.logger.error(
        `Error checking rate limit for ${exchangeDetails.name}:`,
        error,
      );
      // On error, allow collection to proceed
      return false;
    }
  }

  /**
   * Update the last run time for the given exchange
   * @param exchangeDetails - The exchange details
   */
  async updateLastRunTime(exchangeDetails: ExchangeDetails): Promise<void> {
    try {
      const cacheKey = this.buildCacheKey(exchangeDetails.name);
      const now = Date.now();

      // Set the last run time with TTL of 24 hours (86400 seconds)
      await this.cacheService.set(cacheKey, now, { ttl: 86400 });

      this.logger.debug(
        `📝 Updated last run time for ${exchangeDetails.name} to ${new Date(now).toISOString()}`,
      );
    } catch (error) {
      this.logger.error(
        `Error updating last run time for ${exchangeDetails.name}:`,
        error,
      );
    }
  }

  /**
   * Get the time until next collection for the given exchange
   * @param exchangeDetails - The exchange details
   * @returns Time in milliseconds until next collection, or 0 if no previous run
   */
  async getTimeUntilNextCollection(
    exchangeDetails: ExchangeDetails,
  ): Promise<number> {
    try {
      const cacheKey = this.buildCacheKey(exchangeDetails.name);
      const lastRunTime = await this.cacheService.get<number>(cacheKey);

      if (!lastRunTime) {
        return 0;
      }

      const now = Date.now();
      const timeSinceLastRun = now - lastRunTime;
      const intervalMs = this.collectionInterval * 60 * 1000;

      return Math.max(0, intervalMs - timeSinceLastRun);
    } catch (error) {
      this.logger.error(
        `Error getting time until next collection for ${exchangeDetails.name}:`,
        error,
      );
      return 0;
    }
  }

  /**
   * Get collection statistics for all exchanges
   * @returns Object with exchange names and their last run times
   */
  async getCollectionStats(): Promise<Record<string, any>> {
    try {
      // This is a simplified implementation - in a real scenario, you might want to
      // store exchange names in a separate Redis set for easier iteration
      const stats: Record<string, any> = {};

      // For now, return basic stats
      stats.collectionInterval = this.collectionInterval;
      stats.collectionIntervalMs = this.collectionInterval * 60 * 1000;

      return stats;
    } catch (error) {
      this.logger.error('Error getting collection stats:', error);
      return {};
    }
  }

  /**
   * Clear the rate limit cache for a specific exchange
   * @param exchangeName - The exchange name
   */
  async clearRateLimit(exchangeName: string): Promise<void> {
    try {
      const cacheKey = this.buildCacheKey(exchangeName);
      await this.cacheService.delete(cacheKey);
      this.logger.log(`🧹 Cleared rate limit cache for ${exchangeName}`);
    } catch (error) {
      this.logger.error(
        `Error clearing rate limit for ${exchangeName}:`,
        error,
      );
    }
  }

  /**
   * Build the cache key for an exchange
   * @param exchangeName - The exchange name
   * @returns The cache key
   */
  private buildCacheKey(exchangeName: string): string {
    return `${this.cachePrefix}:${exchangeName.toLowerCase()}`;
  }
}
