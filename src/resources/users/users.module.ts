import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { CacheConfig } from '@core/configs';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CacheModule.registerAsync<RedisClientOptions>(CacheConfig),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
