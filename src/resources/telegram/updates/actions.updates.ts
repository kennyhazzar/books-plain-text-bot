import { Action, Update } from 'nestjs-telegraf';
import { Update as TelegrafUpdate } from 'telegraf/typings/core/types/typegram';
import { BooksService } from '@resources/books/books.service';
import { CommonConfigs, MainUpdateContext } from '@core/types';
import { GetChunkDto } from '../../books/dto';
import {
  getBooksKeyboard,
  getChunkSettingsKeyboard,
  getOneBookMenuKeyboard,
  getReadBookKeyboard,
  languageInlineKeyboard,
} from '@core/telegram';
import { ConfigService } from '@nestjs/config';
import { Actions } from '@core/telegram/actions';
import {
  getLanguageByCode,
  getTextByLanguageCode,
  joinBookText,
} from '@core/utils';
import { UsersService } from '../../users/users.service';

@Update()
export class ActionsUpdate {
  constructor(
    private readonly booksService: BooksService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @Action(/set_chunk_+/)
  async updateChunk(ctx: MainUpdateContext) {
    try {
      const languageCode = ctx.state.user.languageCode;
      const { callback_query: callbackQuery } =
        ctx.update as TelegrafUpdate.CallbackQueryUpdate;

      const [, chunkSize] = (callbackQuery as any).data.split('chunk_');

      if (+chunkSize === ctx.state.user.chunkSize) {
        ctx.answerCbQuery(
          getTextByLanguageCode(languageCode, 'no_changes_detected'),
        );

        return;
      }

      this.usersService.updateChunkSize(ctx.state.user, +chunkSize);

      ctx.editMessageText(getTextByLanguageCode(languageCode, 'set_chunk'), {
        reply_markup: {
          inline_keyboard: getChunkSettingsKeyboard(+chunkSize),
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  @Action(/book_menu_download_+/)
  async downloadBook(ctx: MainUpdateContext) {
    const languageCode = ctx.state.user.languageCode;
    const apiKey = ctx.state.user.apiKey;

    try {
      const { callback_query: callbackQuery } =
        ctx.update as TelegrafUpdate.CallbackQueryUpdate;

      const [, bookId] = (callbackQuery as any).data.split('download_');

      const book = await this.booksService.getBookById(bookId, apiKey);

      if (book) {
        const chunks = await this.booksService.getAllChunksByBookId(
          bookId,
          apiKey,
        );

        const source = Buffer.from(joinBookText(chunks), 'utf-8');

        await ctx.sendDocument(
          { source, filename: book.fileName },
          {
            caption: book.fileName,
          },
        );
        await ctx.answerCbQuery(book.fileName);
      } else {
        ctx.editMessageText(
          getTextByLanguageCode(languageCode, 'book_not_found'),
        );
      }
    } catch (error) {
      ctx.answerCbQuery('error');
      console.log(error);
    }
  }

  @Action(/book_menu_delete_+/)
  async deleteBook(ctx: MainUpdateContext) {
    const languageCode = ctx.state.user.languageCode;

    try {
      const { callback_query: callbackQuery } =
        ctx.update as TelegrafUpdate.CallbackQueryUpdate;

      const [, bookId] = (callbackQuery as any).data.split('delete_');

      const { result: isDelete, book } = await this.booksService.deleteBookById(
        bookId,
        ctx.state.user.apiKey,
      );

      if (!isDelete) {
        ctx.editMessageText(
          getTextByLanguageCode(languageCode, 'delete_error'),
        );

        return;
      }

      ctx.editMessageText(
        getTextByLanguageCode(languageCode, 'delete_result', {
          title: book.title,
          author: book.author,
        }),
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: getTextByLanguageCode(languageCode, 'menu_particle'),
                  callback_data: `${Actions.MENU_PAGE}1`,
                },
              ],
            ],
          },
          parse_mode: 'Markdown',
        },
      );
    } catch (error) {
      ctx.answerCbQuery('error');
      console.log(error);
    }
  }

  @Action(/book_menu_read_chat_+/)
  async readBookInChat(ctx: MainUpdateContext) {
    const languageCode = ctx.state.user.languageCode;

    try {
      const { callback_query: callbackQuery } =
        ctx.update as TelegrafUpdate.CallbackQueryUpdate;

      const [, bookId] = (callbackQuery as any).data.split('chat_');

      const apiKey = ctx.state.user.apiKey;
      const book = await this.booksService.getBookById(bookId, apiKey);

      if (!book) {
        ctx.reply(getTextByLanguageCode(languageCode, 'book_not_found'));

        return;
      }

      const chunk = await this.booksService.getPageByBookId(
        bookId,
        book.currentPage,
        apiKey,
      );

      ctx.editMessageText(chunk.text, {
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
    } catch (error) {
      ctx.answerCbQuery('error');
      console.log(error);
    }
  }

  @Action(/menu_book_+/)
  async menuBook(ctx: MainUpdateContext) {
    const languageCode = ctx.state.user.languageCode;
    const apiKey = ctx.state.user.apiKey;

    try {
      const { callback_query: callbackQuery } =
        ctx.update as TelegrafUpdate.CallbackQueryUpdate;

      const [, , bookId] = (callbackQuery as any).data.split('_');

      const book = await this.booksService.getBookById(bookId, apiKey);

      if (!book) {
        await ctx.deleteMessage();

        await ctx.reply(getTextByLanguageCode(languageCode, 'book_not_found'));

        return;
      }

      const { id, title, author, currentPage, totalPage, percent } = book;

      const { appUrl } = this.configService.get<CommonConfigs>('common');

      await ctx.editMessageText(
        getTextByLanguageCode(languageCode, 'menu_book', {
          id: `\`${id}\``,
          title,
          author,
          currentPage: `${currentPage}`,
          totalPage: `${totalPage}`,
          percent,
        }),
        {
          reply_markup: {
            inline_keyboard: getOneBookMenuKeyboard(
              bookId,
              languageCode,
              `${appUrl}/r/${id}/${currentPage}?k=${apiKey}`,
            ),
          },
          parse_mode: 'Markdown',
        },
      );
    } catch (error) {
      ctx.answerCbQuery('error');
      console.log(error);
    }
  }

  @Action(/menu_page_+/)
  async menu(ctx: MainUpdateContext) {
    const languageCode = ctx.state.user.languageCode;

    try {
      const { callback_query: callbackQuery } =
        ctx.update as TelegrafUpdate.CallbackQueryUpdate;

      const [, , page] = (callbackQuery as any).data.split('_');

      const { result, totalPageCount, booksCount } =
        await this.booksService.getAll(ctx.state.user.apiKey, +page);

      if (!result.length) {
        ctx.editMessageText(
          getTextByLanguageCode(languageCode, 'menu_books_not_found'),
        );
      }

      const newText = getTextByLanguageCode(languageCode, 'menu_page', {
        currentPage: page,
        totalPage: `${totalPageCount}`,
        bookCount: `${booksCount}`,
      });

      await ctx.editMessageText(newText, {
        reply_markup: {
          inline_keyboard: getBooksKeyboard(result, +page, totalPageCount),
        },
      });
    } catch (error) {
      ctx.answerCbQuery(
        getTextByLanguageCode(languageCode, 'no_changes_detected'),
      );
    }
  }

  @Action(/demo_page_+/)
  async getDemoPage(ctx: MainUpdateContext) {
    const { callback_query: callbackQuery } =
      ctx.update as TelegrafUpdate.CallbackQueryUpdate;

    const [, , bookId, page] = (callbackQuery as any).data.split('_');

    const chunk = await this.booksService.getPageByBookId(
      bookId,
      +page,
      ctx.state.user.apiKey,
      false,
    );

    if (!chunk) {
      ctx.answerCbQuery('Ошибка! Этой страницы или книги не существует!', {
        show_alert: true,
      });

      return;
    }

    ctx.reply(chunk.text, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Открыть в книге',
              callback_data: `${Actions.PAGE}${bookId}_${page}`,
            },
            {
              text: 'Закрыть',
              callback_data: Actions.CLOSE_BOOK,
            },
          ],
        ],
      },
    });

    ctx.answerCbQuery(`${page} / ${chunk.totalPage}`);
  }

  @Action(Actions.CLOSE_BOOK)
  async closeBook(ctx: MainUpdateContext) {
    ctx.deleteMessage();
  }

  @Action(/page_+/)
  async getPage(ctx: MainUpdateContext) {
    const { callback_query: callbackQuery } =
      ctx.update as TelegrafUpdate.CallbackQueryUpdate;

    const [, bookId, page] = (callbackQuery as any).data.split('_');

    const chunk = await this.booksService.getPageByBookId(
      bookId,
      +page,
      ctx.state.user.apiKey,
    );

    if (!chunk) {
      ctx.answerCbQuery(
        getTextByLanguageCode(
          ctx.state.user.languageCode,
          'error_page_not_found',
        ),
        {
          show_alert: true,
        },
      );

      ctx.deleteMessage();

      return;
    }

    await this.updateMessage(ctx, chunk);
  }

  @Action(/language_+/)
  async setLanguage(ctx: MainUpdateContext) {
    const { callback_query: callbackQuery } =
      ctx.update as TelegrafUpdate.CallbackQueryUpdate;

    const [, , languageCode] = (callbackQuery as any).data.split('_');

    if (languageCode && languageCode === ctx.state.user.languageCode) {
      ctx.answerCbQuery(
        getTextByLanguageCode(
          ctx.state.user.languageCode,
          'language_error_current_choice',
        ),
      );

      return;
    }

    await this.usersService.updateLanguage(ctx.state.user, languageCode);

    await ctx.editMessageText(
      getTextByLanguageCode(languageCode, 'language', {
        code: getLanguageByCode(languageCode)[languageCode],
      }),
      {
        reply_markup: {
          inline_keyboard: languageInlineKeyboard(languageCode),
        },
      },
    );
  }

  private async updateMessage(ctx: MainUpdateContext, chunk: GetChunkDto) {
    const { appUrl } = this.configService.get<CommonConfigs>('common');

    await ctx.editMessageText(chunk.text, {
      reply_markup: {
        inline_keyboard: getReadBookKeyboard(
          chunk.currentPage,
          chunk.totalPage,
          `( ${Math.round((100 * chunk.currentPage) / chunk.totalPage)} % )`,
          chunk.bookId,
          `${appUrl}/r/${chunk.bookId}/${chunk.currentPage}?k=${ctx.state.user.apiKey}`,
          ctx.state.user.languageCode,
        ),
      },
    });

    await ctx.answerCbQuery(`${chunk.currentPage} / ${chunk.totalPage}`);
  }
}
