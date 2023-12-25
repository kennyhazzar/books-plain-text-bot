import { Command, On, Update, Use } from 'nestjs-telegraf';
import {
  Document,
  InlineKeyboardButton,
  Message,
} from 'telegraf/typings/core/types/typegram';
import {
  formatBytes,
  getBufferFromUrl,
  getLanguageByCode,
  getTextByLanguageCode,
  joinBookText,
} from '@core/utils';
import { BooksService } from '@resources/books/books.service';
import { ConfigService } from '@nestjs/config';
import { CommonConfigs, MainUpdateContext } from '@core/types';
import { UsersService } from '../../users/users.service';
import { User } from '@resources/users/entities';
import { getReadBookKeyboard, Actions, languageMenu } from '@core/telegram';

@Update()
export class MainUpdate {
  constructor(
    private readonly booksService: BooksService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @Use()
  async checkUserMiddleware(ctx: MainUpdateContext, next: () => Promise<void>) {
    let user: User;

    if (ctx) {
      user = await this.checkUser(ctx);
      ctx.state.user = user;
      await next();

      return;
    }

    await next();
  }

  @Command('lang')
  async languageCommand(ctx: MainUpdateContext) {
    const languageCode = ctx.state.user.languageCode;

    console.log(languageCode);

    await ctx.reply(
      getTextByLanguageCode(languageCode, 'language', {
        code: getLanguageByCode(languageCode)[languageCode],
      }),
      languageMenu(languageCode),
    );
  }

  @Command('refresh')
  async updateToken(ctx: MainUpdateContext) {
    const token = await this.usersService.updateToken(ctx.state.user);

    const { appUrl } = this.configService.get<CommonConfigs>('common');

    await ctx.reply(
      getTextByLanguageCode(ctx.state.user.languageCode, 'update_token', {
        menuLink: `${appUrl}/menu?k=${token}`,
      }),
    );
  }

  @Command('search')
  async searchByText(ctx: MainUpdateContext) {
    const message = ctx.message as Message.TextMessage;
    const languageCode = ctx.state.user.languageCode;

    if (message.text === '/search') {
      ctx.reply(getTextByLanguageCode(languageCode, 'search'));

      return;
    }

    const [, bookId, text] = message.text.split(' ');

    if (!Number.isNaN(+bookId)) {
      const apiKey = ctx.state.user.apiKey;
      const book = await this.booksService.getBookById(+bookId, apiKey);

      if (!book) {
        ctx.reply('Книга не была найдена!');

        return;
      }

      const [searchResult, searchResultCount] = await this.booksService.search(
        text,
        +bookId,
        apiKey,
      );

      if (!searchResult) {
        ctx.reply(getTextByLanguageCode(languageCode, 'search_empty_result'));

        return;
      }

      const keyboard: InlineKeyboardButton[][] = [
        ...searchResult.map(({ index }) => [
          {
            text: getTextByLanguageCode(languageCode, 'page_index', {
              index: String(index),
            }),
            callback_data: `demo_page_${bookId}_${index}`,
          },
        ]),
        [
          {
            text: getTextByLanguageCode(languageCode, 'close'),
            callback_data: Actions.CLOSE_BOOK,
          },
        ],
      ];

      ctx.reply(
        getTextByLanguageCode(languageCode, 'search_result', {
          searchResultCount: `${searchResultCount}`,
        }),
        {
          reply_markup: {
            inline_keyboard: keyboard,
          },
        },
      );
    } else {
      ctx.reply(getTextByLanguageCode(languageCode, 'book_id_parse_error'));
    }
  }

  @Command('read')
  async readBookInChat(ctx: MainUpdateContext) {
    const message = ctx.message as Message.TextMessage;
    const languageCode = ctx.state.user.languageCode;

    if (message.text === '/read') {
      ctx.reply(getTextByLanguageCode(languageCode, 'read'));

      return;
    }

    const [, bookId] = message.text.split(' ');

    if (!Number.isNaN(+bookId)) {
      const apiKey = ctx.state.user.apiKey;
      const book = await this.booksService.getBookById(+bookId, apiKey);

      if (!book) {
        ctx.reply(getTextByLanguageCode(languageCode, 'book_not_found'));

        return;
      }

      const chunk = await this.booksService.getPageByBookId(
        +bookId,
        book.currentPage,
        apiKey,
      );

      ctx.reply(chunk.text, {
        reply_markup: {
          inline_keyboard: getReadBookKeyboard(
            chunk.currentPage,
            chunk.totalPage,
            `( ${Math.round((100 * chunk.currentPage) / chunk.totalPage)} % )`,
            chunk.bookId,
            book.continousLink,
            languageCode,
          ),
        },
      });
    } else {
      ctx.reply(getTextByLanguageCode(languageCode, 'book_id_parse_error'));
    }
  }

  @Command('download')
  async downloadBook(ctx: MainUpdateContext) {
    const message = ctx.message as Message.TextMessage;
    const apiKey = ctx.state.user.apiKey;
    const languageCode = ctx.state.user.languageCode;

    if (message.text === '/download') {
      ctx.reply(getTextByLanguageCode(languageCode, 'download'));

      return;
    }

    const [, bookId] = message.text.split(' ');

    const book = await this.booksService.getBookById(+bookId, apiKey);

    if (book) {
      const chunks = await this.booksService.getAllChunksByBookId(
        +bookId,
        apiKey,
      );

      const source = Buffer.from(joinBookText(chunks), 'utf-8');

      await ctx.sendDocument(
        { source, filename: book.fileName },
        {
          caption: book.fileName,
        },
      );
    } else {
      ctx.reply(getTextByLanguageCode(languageCode, 'book_not_found'));
    }
  }

  @Command('link')
  async getLink(ctx: MainUpdateContext) {
    const { appUrl } = this.configService.get<CommonConfigs>('common');

    ctx.reply(
      getTextByLanguageCode(ctx.state.user.languageCode, 'link', {
        appUrl,
        apiKey: ctx.state.user.apiKey,
      }),
    );
  }

  @Command('delete')
  async deleteBook(ctx: MainUpdateContext) {
    const message = ctx.message as Message.TextMessage;
    const languageCode = ctx.state.user.languageCode;

    if (message.text === '/delete') {
      ctx.reply(getTextByLanguageCode(ctx.state.user.languageCode, 'delete'));

      return;
    }

    const [, bookId] = message.text.split(' ');

    const { result: isDelete, book } = await this.booksService.deleteBookById(
      +bookId,
      ctx.state.user.apiKey,
    );

    if (!isDelete) {
      ctx.reply(getTextByLanguageCode(languageCode, 'delete_error'));

      return;
    }

    ctx.reply(
      getTextByLanguageCode(languageCode, 'delete_result', {
        title: book.title,
        author: book.author,
      }),
      {
        parse_mode: 'Markdown',
      },
    );
  }

  @On('document')
  async getBook(ctx: MainUpdateContext) {
    const user = ctx.state.user;
    const languageCode = user.languageCode;

    let processMessageId: number;
    let fileUrl = '';

    const {
      file_name: fileName,
      file_id: fileId,
      file_size: fileSize,
    } = (ctx.message as any).document as Document;
    const author = ((ctx.message as any)?.caption as string) || 'noname';

    if (fileSize > user.fileSizeLimit) {
      ctx.reply(
        getTextByLanguageCode(languageCode, 'document_size_limit_error', {
          fileSizeLimit: formatBytes(user.fileSizeLimit),
          fileSize: formatBytes(fileSize),
        }),
      );

      return;
    }

    const booksCount = await this.booksService.getBooksCountByTelegramId(
      user.telegramId,
    );

    if (user.booksLimit <= booksCount) {
      ctx.reply(
        getTextByLanguageCode(languageCode, 'document_books_count_error', {
          userLimit: String(user.booksLimit),
        }),
      );

      return;
    }

    if (fileName.endsWith('.txt')) {
      const messageReplyResult = await ctx.reply(
        getTextByLanguageCode(languageCode, 'document_process_message', {
          fileName,
          author,
        }),
      );
      processMessageId = messageReplyResult.message_id;

      try {
        const link = await ctx.telegram.getFileLink(fileId);

        fileUrl = link.href;
      } catch (error) {
        console.log(error);
        ctx.deleteMessage(processMessageId);
        await ctx.reply(getTextByLanguageCode(languageCode, 'document_error'));

        return;
      }

      try {
        const source = await getBufferFromUrl(fileUrl);

        const bookId = await this.booksService.createBook({
          title: fileName,
          bookText: source.toString(),
          author,
          user,
        });

        const { appUrl } = this.configService.get<CommonConfigs>('common');

        ctx.deleteMessage(processMessageId);

        await ctx.reply(`\`${appUrl}/r/${bookId}/1?k=${user.apiKey}\``, {
          reply_to_message_id: ctx.message.message_id,
          parse_mode: 'Markdown',
        });
      } catch (error) {
        console.log(error);
        ctx.deleteMessage(processMessageId);
        await ctx.reply(getTextByLanguageCode(languageCode, 'document_error'));

        return;
      }
    } else {
      ctx.reply(getTextByLanguageCode(languageCode, 'document_not_txt_error'));
    }
  }

  @On('text')
  async onText(ctx: MainUpdateContext) {
    ctx.reply(getTextByLanguageCode(ctx.state.user.languageCode, 'start'));
  }

  private async checkUser(ctx: MainUpdateContext): Promise<User | null> {
    let user = await this.usersService.getByTelegramId(ctx.chat.id);

    if (!user) {
      const languageCode = ctx.from.language_code === 'ru' ? 'ru' : 'en';

      user = await this.usersService.insert({
        telegramId: ctx.chat.id,
        username: ctx.from?.username,
        firstName: ctx.from?.first_name,
        secondName: ctx.from?.last_name,
        languageCode,
      });
    }

    if (user.isBlocked) {
      return;
    }

    return user;
  }
}
