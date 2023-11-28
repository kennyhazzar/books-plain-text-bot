import { Controller, Get, Param, ParseIntPipe, Render } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller()
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('r/:id/:page')
  @Render('page')
  async getBookPage(
    @Param('id', ParseIntPipe) bookId: number,
    @Param('page', ParseIntPipe) page: number,
  ) {
    const chunk = await this.booksService.getPageByBookId(bookId, page);

    if (chunk) {
      return {
        ...chunk,
        back: `http://localhost:3000/r/${chunk.bookId}/${
          page === 1 ? page : page - 1
        }`,
        next: `http://localhost:3000/r/${chunk.bookId}/${page + 1}`,
      };
    } else {
      return {
        title: 'Не найдено',
        text: 'Страница или книга не найдены!',
      };
    }
  }
}
