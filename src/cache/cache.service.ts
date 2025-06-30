import { Injectable, OnModuleDestroy, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { CacheConfigService } from './cache-config.service';

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly configService: CacheConfigService) {
    this.logger.log('Initializing Redis cache service...');

    const config = this.configService.redisConfig;
    this.logger.log(
      `Redis configuration: ${config.host}:${config.port}, DB: ${config.db}, Prefix: ${config.keyPrefix}`,
    );

    this.redis = new Redis(config);

    this.setupRedisEventHandlers();
  }

  private setupRedisEventHandlers() {
    this.redis.on('connect', () => {
      this.logger.log('✅ Redis connection established successfully');
    });

    this.redis.on('ready', () => {});

    this.redis.on('error', error => {
      this.logger.error('❌ Redis connection error:', error);
    });

    this.redis.on('close', () => {
      this.logger.warn('⚠️ Redis connection closed');
    });

    this.redis.on('reconnecting', delay => {
      this.logger.log(`🔄 Redis reconnecting in ${delay}ms...`);
    });

    this.redis.on('end', () => {
      this.logger.warn('⚠️ Redis connection ended');
    });

    this.redis.on('warning', warning => {
      this.logger.warn('⚠️ Redis warning:', warning);
    });
  }

  async onModuleInit() {
    try {
      await this.redis.ping();
    } catch (error) {
      this.logger.error('❌ Failed to initialize cache service:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('🛑 Shutting down cache service...');
    try {
      await this.redis.quit();
      this.logger.log('✅ Redis connection closed gracefully');
    } catch (error) {
      this.logger.error('❌ Error during cache service shutdown:', error);
    }
  }

  async get<T>(key: string, prefix?: string): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, prefix);
      const value = await this.redis.get(fullKey);

      if (value === null) {
        this.logger.debug(`Cache miss for key: ${fullKey}`);
        return null;
      }

      this.logger.debug(`Cache hit for key: ${fullKey}`);
      return JSON.parse(value);
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const { ttl = this.configService.defaultTTL, prefix } = options;
      const fullKey = this.buildKey(key, prefix);
      const serializedValue = JSON.stringify(value);

      if (ttl > 0) {
        await this.redis.setex(fullKey, ttl, serializedValue);
        this.logger.debug(`Cached key: ${fullKey} with TTL: ${ttl}s`);
      } else {
        await this.redis.set(fullKey, serializedValue);
        this.logger.debug(`Cached key: ${fullKey} (no expiration)`);
      }
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  async delete(key: string, prefix?: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, prefix);
      const result = await this.redis.del(fullKey);
      const deleted = result > 0;

      if (deleted) {
        this.logger.debug(`Deleted cache key: ${fullKey}`);
      } else {
        this.logger.debug(`Cache key not found for deletion: ${fullKey}`);
      }

      return deleted;
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
      return false;
    }
  }

  async deleteMultiple(keys: string[], prefix?: string): Promise<number> {
    try {
      const fullKeys = keys.map(key => this.buildKey(key, prefix));
      const result = await this.redis.del(...fullKeys);
      this.logger.debug(`Deleted ${result} out of ${fullKeys.length} cache keys`);
      return result;
    } catch (error) {
      this.logger.error('Error deleting multiple cache keys:', error);
      return 0;
    }
  }

  async exists(key: string, prefix?: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, prefix);
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of cache key ${key}:`, error);
      return false;
    }
  }

  async getTTL(key: string, prefix?: string): Promise<number> {
    try {
      const fullKey = this.buildKey(key, prefix);
      return await this.redis.ttl(fullKey);
    } catch (error) {
      this.logger.error(`Error getting TTL for cache key ${key}:`, error);
      return -1;
    }
  }

  async setTTL(key: string, ttl: number, prefix?: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, prefix);
      const result = await this.redis.expire(fullKey, ttl);
      if (result === 1) {
        this.logger.debug(`Set TTL for key: ${fullKey} to ${ttl}s`);
      }
      return result === 1;
    } catch (error) {
      this.logger.error(`Error setting TTL for cache key ${key}:`, error);
      return false;
    }
  }

  async increment(key: string, amount: number = 1, options: CacheOptions = {}): Promise<number> {
    try {
      const { ttl = this.configService.defaultTTL, prefix } = options;
      const fullKey = this.buildKey(key, prefix);

      const result = await this.redis.incrby(fullKey, amount);

      if (ttl > 0) {
        await this.redis.expire(fullKey, ttl);
      }

      this.logger.debug(`Incremented key: ${fullKey} by ${amount}, new value: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Error incrementing cache key ${key}:`, error);
      return 0;
    }
  }

  async decrement(key: string, amount: number = 1, options: CacheOptions = {}): Promise<number> {
    try {
      const { ttl = this.configService.defaultTTL, prefix } = options;
      const fullKey = this.buildKey(key, prefix);

      const result = await this.redis.decrby(fullKey, amount);

      if (ttl > 0) {
        await this.redis.expire(fullKey, ttl);
      }

      this.logger.debug(`Decremented key: ${fullKey} by ${amount}, new value: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Error decrementing cache key ${key}:`, error);
      return 0;
    }
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const cached = await this.get<T>(key, options.prefix);

    if (cached !== null) {
      this.logger.debug(`Cache hit for getOrSet: ${key}`);
      return cached;
    }

    this.logger.debug(`Cache miss for getOrSet: ${key}, executing factory`);
    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  async clear(): Promise<void> {
    try {
      this.logger.warn('🧹 Clearing all cache data...');
      await this.redis.flushdb();
      this.logger.log('✅ Cache cleared successfully');
    } catch (error) {
      this.logger.error('❌ Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ keys: number; memory: string }> {
    try {
      const [keys, memory] = await Promise.all([this.redis.dbsize(), this.redis.memory('STATS')]);

      return {
        keys,
        memory: memory ? `${Math.round(Number(memory) / 1024 / 1024)}MB` : 'Unknown',
      };
    } catch (error) {
      this.logger.error('Error getting cache stats:', error);
      return { keys: 0, memory: 'Unknown' };
    }
  }

  private buildKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || this.configService.redisConfig.keyPrefix || 'youcoin:';
    return `${keyPrefix}${key}`;
  }

  getRedisClient(): Redis {
    return this.redis;
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
  }> {
    try {
      await this.redis.ping();
      return { status: 'healthy', message: 'Redis connection is working' };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Redis connection failed: ${error.message}`,
      };
    }
  }
}
