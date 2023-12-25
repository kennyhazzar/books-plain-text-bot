import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Redirect,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { ConfigService } from '@nestjs/config';
import { CommonConfigs, TelegrafConfigs } from '@core/types';
import { UsersService } from '@resources/users/users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { HandlebarsService } from '@gboutte/nestjs-hbs';

@Controller()
export class BooksController {
  constructor(
    private readonly userService: UsersService,
    private readonly booksService: BooksService,
    private readonly configService: ConfigService,
    private readonly hbsService: HandlebarsService,
  ) {}

  @Get()
  @Redirect()
  async redirectToMain(@Query('k') apiKey: string) {
    if (apiKey) {
      const { appUrl: url } = this.configService.get<CommonConfigs>('common');
      return {
        url,
      };
    } else {
      const { url } = this.configService.get<TelegrafConfigs>('tg');

      return {
        url,
      };
    }
  }

  @Get('menu')
  async getAll(
    @Query('k') apiKey: string,
    @Query('p', new DefaultValuePipe(1)) page: number,
  ) {
    const { url } = this.configService.get<TelegrafConfigs>('tg');

    if (!apiKey) {
      throw new UnauthorizedException(
        `query param "k" is required! use ?k=<key>, or sign up in ${url}`,
      );
    }

    const {
      result: books,
      userName,
      pageLinks,
    } = await this.booksService.getAll(apiKey, page);

    return this.hbsService.renderFile('books.hbs', {
      books,
      userName,
      pageLinks,
    });
  }

  @Get('r/:id/:page')
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

    const { appUrl } = this.configService.get<CommonConfigs>('common');

    if (chunk) {
      return this.hbsService.renderFile('page.hbs', {
        ...chunk,
        percent: `( ${Math.round(
          (100 * chunk.currentPage) / chunk.totalPage,
        )} % )`,
        main: `${appUrl}/menu${apiKeyParam}`,
        back: `${appUrl}/r/${chunk.bookId}/${
          page === 1 ? page : page - 1
        }${apiKeyParam}`,
        next: `${appUrl}/r/${chunk.bookId}/${page + 1}${apiKeyParam}`,
      });
    } else {
      return this.hbsService.renderFile('page.hbs', {
        main: `${appUrl}${apiKeyParam}`,
        title: 'Не найдено',
        text: 'Страница или книга не найдены!',
      });
    }
  }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 128000000,
        files: 1,
      },
    }),
  )
  async uploadFile(
    @Query('k') apiKey: string,
    @Query('author', new DefaultValuePipe('noname')) author: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!apiKey) {
      throw new UnauthorizedException(
        'query param "k" is required! use ?k=<key>',
      );
    }

    if (file.mimetype === 'text/plain') {
      const user = await this.userService.getByApiKey(apiKey);

      if (!user) {
        throw new UnauthorizedException('we do not recognize you!');
      }

      const booksCount = await this.booksService.getBooksCountByTelegramId(
        user.telegramId,
      );

      if (user.booksLimit <= booksCount) {
        throw new BadRequestException('books limit!');
      }

      try {
        const id = await this.booksService.createBook({
          title: file.originalname,
          bookText: file.buffer.toString(),
          author,
          user,
        });

        const { appUrl } = this.configService.get<CommonConfigs>('common');

        return {
          bookUrl: `${appUrl}/r/${id}/1?k=${apiKey}`,
        };
      } catch (error) {
        throw new InternalServerErrorException('error in creating book!');
      }
    } else {
      throw new BadRequestException(
        `you need mimetype: text/plain. your file's mimetype is ${file.mimetype}`,
      );
    }
  }
}
