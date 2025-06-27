import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export interface RedisConfig extends Omit<RedisOptions, 'tls'> {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
  keepAlive?: number;
  family?: number;
  connectTimeout?: number;
  commandTimeout?: number;
}

@Injectable()
export class CacheConfigService {
  private readonly logger = new Logger(CacheConfigService.name);

  constructor(private configService: ConfigService) {
    this.logger.log('🔧 Initializing cache configuration service...');
  }

  get redisConfig(): RedisConfig {
    const config = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      keyPrefix: this.configService.get<string>('REDIS_KEY_PREFIX', 'youcoin:'),
      retryDelayOnFailover: this.configService.get<number>(
        'REDIS_RETRY_DELAY',
        100,
      ),
      maxRetriesPerRequest: this.configService.get<number>(
        'REDIS_MAX_RETRIES',
        3,
      ),
      lazyConnect: this.configService.get<boolean>('REDIS_LAZY_CONNECT', true),
      keepAlive: this.configService.get<number>('REDIS_KEEP_ALIVE', 30000),
      family: this.configService.get<number>('REDIS_FAMILY', 4),
      connectTimeout: this.configService.get<number>(
        'REDIS_CONNECT_TIMEOUT',
        10000,
      ),
      commandTimeout: this.configService.get<number>(
        'REDIS_COMMAND_TIMEOUT',
        5000,
      ),
    };

    return config;
  }

  get defaultTTL(): number {
    const ttl = this.configService.get<number>('CACHE_DEFAULT_TTL', 3600);
    this.logger.log(
      `⏰ Default TTL: ${ttl} seconds (${Math.round(ttl / 60)} minutes)`,
    );
    return ttl;
  }

  get maxTTL(): number {
    const maxTtl = this.configService.get<number>('CACHE_MAX_TTL', 86400 * 365);
    this.logger.log(
      `⏰ Max TTL: ${maxTtl} seconds (${Math.round(maxTtl / 3600)} hours)`,
    );
    return maxTtl;
  }
}
