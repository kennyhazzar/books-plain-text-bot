import { Module } from '@nestjs/common';
import { MainUpdate } from './updates';
import { BooksModule } from '@resources/books/books.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [BooksModule, UsersModule],
  providers: [MainUpdate],
})
export class TelegramModule {}
