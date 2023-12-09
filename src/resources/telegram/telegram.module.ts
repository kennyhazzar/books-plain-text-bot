import { Module } from '@nestjs/common';
import { MainUpdate } from './updates';
import { BooksModule } from '@resources/books/books.module';
import { UsersModule } from '../users/users.module';
import { ActionsUpdate } from './updates/actions.updates';

@Module({
  imports: [BooksModule, UsersModule],
  providers: [MainUpdate, ActionsUpdate],
})
export class TelegramModule {}
