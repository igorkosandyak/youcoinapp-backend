import { Module, Global, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CacheConfigService } from './cache-config.service';
import { ExampleCacheService } from './example.service';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'CACHE_MODULE_LOGGER',
      useFactory: () => {
        const logger = new Logger('CacheModule');

        return logger;
      },
    },
    CacheService,
    CacheConfigService,
    ExampleCacheService,
  ],
  exports: [CacheService, ExampleCacheService],
})
export class CacheModule {
  private readonly logger = new Logger(CacheModule.name);

  constructor() {}
}
