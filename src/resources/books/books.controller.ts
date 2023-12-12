import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Render,
  UnauthorizedException,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { ConfigService } from '@nestjs/config';
import { CommonConfigs } from '@core/types';

@Controller()
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Render('books')
  async getAll(
    @Query('k') apiKey: string,
    @Query('p', new DefaultValuePipe(1)) page: number,
  ) {
    if (!apiKey) {
      throw new UnauthorizedException(
        'query param "k" is required! use ?k=<key>',
      );
    }

    const {
      result: books,
      userName,
      pageLinks,
    } = await this.booksService.getAll(apiKey, page);

    return { books, userName, pageLinks };
  }

  @Get('r/:id/:page')
  @Render('page')
  async getBookPage(
    @Param('id', ParseIntPipe) bookId: number,
    @Param('page', ParseIntPipe) page: number,
    @Query('k') apiKey: string,
  ) {
    if (!apiKey) {
      throw new UnauthorizedException(
        'query param "k" is required! use ?k=<key>',
      );
    }

    const apiKeyParam = `?k=${apiKey}`;

    const chunk = await this.booksService.getPageByBookId(bookId, page, apiKey);

    if (chunk) {
      const { appUrl } = this.configService.get<CommonConfigs>('common');

      return {
        ...chunk,
        main: `${appUrl}${apiKeyParam}`,
        back: `${appUrl}/r/${chunk.bookId}/${
          page === 1 ? page : page - 1
        }${apiKeyParam}`,
        next: `${appUrl}/r/${chunk.bookId}/${page + 1}${apiKeyParam}`,
      };
    } else {
      const { appUrl } = this.configService.get<CommonConfigs>('common');

      return {
        main: `${appUrl}${apiKeyParam}`,
        title: 'Не найдено',
        text: 'Страница или книга не найдены!',
      };
    }
  }
}
