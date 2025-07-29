import { RedisConfigModule } from '@/common/config/redis/redis.connection';
import { Module } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';

@Module({
  imports: [RedisConfigModule],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
