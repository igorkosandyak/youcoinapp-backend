# Redis Cache Module

A comprehensive Redis cache module for NestJS applications with automatic caching, decorators, and interceptors.

## Features

- 🔄 **Automatic Caching**: Use decorators to automatically cache method results
- ⚡ **High Performance**: Built on ioredis for optimal Redis performance
- 🛡️ **Error Handling**: Graceful error handling with logging
- 🔧 **Configurable**: Flexible configuration via environment variables
- 📊 **Statistics**: Built-in cache statistics and monitoring
- 🎯 **Type Safe**: Full TypeScript support with generics

## Installation

The module is already included in the project. Make sure Redis is running and configure the environment variables.

## Configuration

Add these environment variables to your `.env` file:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=youcoin:
REDIS_RETRY_DELAY=100
REDIS_MAX_RETRIES=3
REDIS_LAZY_CONNECT=true
REDIS_KEEP_ALIVE=30000
REDIS_FAMILY=4
REDIS_CONNECT_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000

# Cache Configuration
CACHE_DEFAULT_TTL=3600
CACHE_MAX_TTL=86400
```

## Usage

### Basic Usage

```typescript
import { Injectable } from '@nestjs/common';
import { CacheService } from './cache';

@Injectable()
export class UserService {
  constructor(private readonly cacheService: CacheService) {}

  async getUser(id: string) {
    // Get from cache or fetch from database
    return this.cacheService.getOrSet(
      `user:${id}`,
      async () => {
        // Fetch from database
        return await this.userRepository.findById(id);
      },
      { ttl: 1800 }, // 30 minutes
    );
  }

  async updateUser(id: string, data: any) {
    // Update in database
    const user = await this.userRepository.update(id, data);

    // Invalidate cache
    await this.cacheService.delete(`user:${id}`);

    return user;
  }
}
```

### Using Decorators

```typescript
import { Injectable } from '@nestjs/common';
import { Cache, CacheKey, CacheTTL } from './cache';

@Injectable()
export class ProductService {
  @Cache('product:{0}', 3600) // Cache for 1 hour
  async getProduct(id: string) {
    return await this.productRepository.findById(id);
  }

  @CacheKey('products:list')
  @CacheTTL(1800) // 30 minutes
  async getProducts() {
    return await this.productRepository.findAll();
  }
}
```

### Using Interceptor

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from './cache';

@Controller('products')
@UseInterceptors(CacheInterceptor)
export class ProductController {
  @Get(':id')
  @Cache('product:{0}', 3600)
  async getProduct(id: string) {
    return await this.productService.getProduct(id);
  }
}
```

## API Reference

### CacheService Methods

#### `get<T>(key: string, prefix?: string): Promise<T | null>`

Get a value from cache.

#### `set<T>(key: string, value: T, options?: CacheOptions): Promise<void>`

Set a value in cache.

#### `delete(key: string, prefix?: string): Promise<boolean>`

Delete a key from cache.

#### `deleteMultiple(keys: string[], prefix?: string): Promise<number>`

Delete multiple keys from cache.

#### `exists(key: string, prefix?: string): Promise<boolean>`

Check if a key exists in cache.

#### `getTTL(key: string, prefix?: string): Promise<number>`

Get TTL for a key.

#### `setTTL(key: string, ttl: number, prefix?: string): Promise<boolean>`

Set TTL for a key.

#### `increment(key: string, amount?: number, options?: CacheOptions): Promise<number>`

Increment a numeric value.

#### `decrement(key: string, amount?: number, options?: CacheOptions): Promise<number>`

Decrement a numeric value.

#### `getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions): Promise<T>`

Get or set value using cache-aside pattern.

#### `clear(): Promise<void>`

Clear all cache (use with caution).

#### `getStats(): Promise<{ keys: number; memory: string }>`

Get cache statistics.

### CacheOptions Interface

```typescript
interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix
}
```

### Decorators

#### `@Cache(key: string, ttl?: number, prefix?: string)`

Cache decorator for methods with key template support.

#### `@CacheKey(key: string)`

Set cache key for a method.

#### `@CacheTTL(ttl: number)`

Set TTL for a method.

## Best Practices

1. **Use meaningful key names**: Use descriptive keys like `user:profile:123` instead of just `123`
2. **Set appropriate TTL**: Don't cache data that changes frequently for too long
3. **Invalidate cache**: Always invalidate cache when data is updated
4. **Use prefixes**: Use prefixes to organize cache keys by feature
5. **Handle cache misses**: Always handle cases where cache is empty
6. **Monitor cache size**: Use `getStats()` to monitor cache usage

## Error Handling

The cache service includes comprehensive error handling:

- Connection errors are logged but don't crash the application
- Failed operations return safe defaults (null, false, 0)
- All errors are logged for debugging

## Performance Tips

1. **Use pipelining** for multiple operations
2. **Set appropriate TTL** to avoid memory issues
3. **Use key prefixes** for better organization
4. **Monitor cache hit rates** with statistics
5. **Use lazy connection** for better startup performance
