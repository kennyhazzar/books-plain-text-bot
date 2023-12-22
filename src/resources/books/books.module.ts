import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book, BooksChunk } from './entities';
import { UsersModule } from '../users/users.module';
import { HandlebarsModule } from '@gboutte/nestjs-hbs';
import { CacheModule } from '@nestjs/cache-manager';
import Handlebars from 'handlebars';
import { CacheConfig } from '@core/configs';
import { RedisClientOptions } from 'redis';

@Module({
  imports: [
    HandlebarsModule.forRoot({
      templateDirectory: 'views',
      compileOptions: {},
      templateOptions: {},
      helpers: [
        {
          name: 'hlp',
          fn: (text: string) =>
            new Handlebars.SafeString(text.replace(/(\r\n|\n|\r)/gm, '<br>')),
        },
      ],
    }),
    TypeOrmModule.forFeature([Book, BooksChunk]),
    CacheModule.registerAsync<RedisClientOptions>(CacheConfig),
    UsersModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
