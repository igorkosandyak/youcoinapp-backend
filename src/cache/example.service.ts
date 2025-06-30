import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.service';
import { Cache, CacheKey, CacheTTL } from './cache.decorators';

@Injectable()
export class ExampleCacheService {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * Example 1: Basic cache usage with getOrSet
   */
  async getUserProfile(userId: string) {
    return this.cacheService.getOrSet(
      `user:profile:${userId}`,
      async () => {
        // Simulate database call
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          id: userId,
          name: `User ${userId}`,
          email: `user${userId}@example.com`,
          lastLogin: new Date().toISOString(),
        };
      },
      { ttl: 1800 }, // 30 minutes
    );
  }

  /**
   * Example 2: Using decorators for automatic caching
   */
  @Cache('product:{0}', 3600) // Cache for 1 hour
  async getProduct(productId: string) {
    // Simulate database call
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      id: productId,
      name: `Product ${productId}`,
      price: Math.random() * 1000,
      category: 'electronics',
    };
  }

  /**
   * Example 3: Separate decorators for key and TTL
   */
  @CacheKey('products:featured')
  @CacheTTL(900) // 15 minutes
  async getFeaturedProducts() {
    // Simulate database call
    await new Promise(resolve => setTimeout(resolve, 150));
    return [
      { id: '1', name: 'Featured Product 1', price: 99.99 },
      { id: '2', name: 'Featured Product 2', price: 149.99 },
      { id: '3', name: 'Featured Product 3', price: 199.99 },
    ];
  }

  /**
   * Example 4: Manual cache operations
   */
  async updateUserProfile(userId: string, profileData: any) {
    // Update in database (simulated)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Invalidate cache
    await this.cacheService.delete(`user:profile:${userId}`);

    // Set new cache value
    await this.cacheService.set(`user:profile:${userId}`, profileData, {
      ttl: 1800,
    });

    return profileData;
  }

  /**
   * Example 5: Counter operations
   */
  async incrementUserLoginCount(userId: string) {
    const key = `user:login:count:${userId}`;
    const count = await this.cacheService.increment(key, 1, { ttl: 86400 }); // 24 hours
    return count;
  }

  /**
   * Example 6: Cache statistics
   */
  async getCacheStats() {
    return await this.cacheService.getStats();
  }

  /**
   * Example 7: Multiple key operations
   */
  async clearUserCache(userId: string) {
    const keys = [`user:profile:${userId}`, `user:settings:${userId}`, `user:preferences:${userId}`];

    const deletedCount = await this.cacheService.deleteMultiple(keys);
    return { deletedCount, userId };
  }

  /**
   * Example 8: Check cache existence
   */
  async isUserCached(userId: string) {
    return await this.cacheService.exists(`user:profile:${userId}`);
  }

  /**
   * Example 9: Get TTL for cached item
   */
  async getUserProfileTTL(userId: string) {
    return await this.cacheService.getTTL(`user:profile:${userId}`);
  }

  /**
   * Example 10: Set custom TTL for existing item
   */
  async extendUserProfileTTL(userId: string, additionalSeconds: number) {
    const currentTTL = await this.cacheService.getTTL(`user:profile:${userId}`);
    if (currentTTL > 0) {
      const newTTL = currentTTL + additionalSeconds;
      return await this.cacheService.setTTL(`user:profile:${userId}`, newTTL);
    }
    return false;
  }
}
