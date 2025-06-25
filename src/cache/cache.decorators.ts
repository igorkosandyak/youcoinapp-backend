import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache_key_metadata';
export const CACHE_TTL_METADATA = 'cache_ttl_metadata';

export interface CacheMetadata {
  key: string;
  ttl?: number;
  prefix?: string;
}

/**
 * Cache decorator for methods
 * @param key Cache key (can include placeholders like {0}, {1} for method arguments)
 * @param ttl Time to live in seconds
 * @param prefix Optional key prefix
 */
export const Cache = (key: string, ttl?: number, prefix?: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, { key, ttl, prefix })(
      target,
      propertyKey,
      descriptor,
    );
    return descriptor;
  };
};

/**
 * Cache key decorator
 * @param key Cache key
 */
export const CacheKey = (key: string) =>
  SetMetadata(CACHE_KEY_METADATA, { key });

/**
 * Cache TTL decorator
 * @param ttl Time to live in seconds
 */
export const CacheTTL = (ttl: number) =>
  SetMetadata(CACHE_TTL_METADATA, { ttl });

/**
 * Generate cache key from template and arguments
 * @param template Key template with placeholders
 * @param args Arguments to substitute
 */
export function generateCacheKey(template: string, args: any[]): string {
  return template.replace(/\{(\d+)\}/g, (match, index) => {
    const argIndex = parseInt(index, 10);
    return args[argIndex] !== undefined ? String(args[argIndex]) : match;
  });
}
