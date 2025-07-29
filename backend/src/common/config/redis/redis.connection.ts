import { RedisModule } from '@nestjs-modules/ioredis';
import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { EnvConfigService } from '../env/env-config.service';

@Global()
@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: async (configService: EnvConfigService) => ({
        type: 'single',
        url: `redis://${configService.get('REDIS_HOST')}:${+configService.get('REDIS_PORT')}/`,
      }),
      inject: [EnvConfigService],
    }),
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: EnvConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST'),
          port: +configService.get('REDIS_PORT'),
        });
      },
      inject: [EnvConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisConfigModule {}
