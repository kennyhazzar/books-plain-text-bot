import { Controller, Get, Param, ParseIntPipe, Render } from '@nestjs/common';
import { BooksService } from './books.service';
import { ConfigService } from '@nestjs/config';
import { CommonConfigs } from '@core/types';

@Controller()
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly configService: ConfigService,
  ) {}

  @Get('all')
  @Render('books')
  async getAll() {
    const books = await this.booksService.getAll();

    return { books };
  }

  @Get('r/:id/:page')
  @Render('page')
  async getBookPage(
    @Param('id', ParseIntPipe) bookId: number,
    @Param('page', ParseIntPipe) page: number,
  ) {
    const chunk = await this.booksService.getPageByBookId(bookId, page);

    if (chunk) {
      const { appUrl } = this.configService.get<CommonConfigs>('common');

      return {
        ...chunk,
        main: `${appUrl}/all`,
        back: `${appUrl}/r/${chunk.bookId}/${page === 1 ? page : page - 1}`,
        next: `${appUrl}/r/${chunk.bookId}/${page + 1}`,
      };
    } else {
      const { appUrl } = this.configService.get<CommonConfigs>('common');

      return {
        main: `${appUrl}/all`,
        title: 'Не найдено',
        text: 'Страница или книга не найдены!',
      };
    }
  }
}
