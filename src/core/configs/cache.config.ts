import { CacheStore } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { RedisConfigs } from '../types';

export const CacheConfig = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const { host, port } = configService.get<RedisConfigs>('redis');

    return {
      store: (await redisStore({
        url: `redis://${host}:${port}`,
        ttl: 86400,
      })) as unknown as CacheStore,
    };
  },
};
