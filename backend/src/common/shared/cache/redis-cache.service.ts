import { buildCacheKey } from '@/common/utils/cache';
import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisCacheService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async setCache(prefix: string, key: string, value: any, duration = 60 * 5) {
    const cacheKey = buildCacheKey(prefix, { key });
    await this.redis.set(cacheKey, JSON.stringify(value), 'EX', duration);
  }

  async getCacheValue(prefix: string, key: string): Promise<any> {
    const cachedValue = await this.redis.get(buildCacheKey(prefix, { key }));
    return cachedValue ? JSON.parse(cachedValue) : null;
  }
}
