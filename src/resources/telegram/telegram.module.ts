import { Module } from '@nestjs/common';
import { MainUpdate } from './updates';
import { BooksModule } from '@resources/books/books.module';

@Module({
  imports: [BooksModule],
  providers: [MainUpdate],
})
export class TelegramModule {}
