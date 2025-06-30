import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA, generateCacheKey } from './cache.decorators';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CacheService) private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const handler = context.getHandler();
    const cacheKey = this.reflector.get<string>(CACHE_KEY_METADATA, handler);
    const cacheTTL = this.reflector.get<number>(CACHE_TTL_METADATA, handler);

    if (!cacheKey) {
      return next.handle();
    }

    const args = context.getArgs();
    const key = generateCacheKey(cacheKey, args);

    // Try to get from cache first
    const cached = await this.cacheService.get(key);
    if (cached !== null) {
      return of(cached);
    }

    // If not in cache, execute the method and cache the result
    return next.handle().pipe(
      tap(async data => {
        if (data !== null && data !== undefined) {
          await this.cacheService.set(key, data, { ttl: cacheTTL });
        }
      }),
    );
  }
}
