import { Action, Update } from 'nestjs-telegraf';
import { Update as TelegrafUpdate } from 'telegraf/typings/core/types/typegram';
import { BooksService } from '@resources/books/books.service';
import { CommonConfigs, MainUpdateContext } from '@core/types';
import { GetChunkDto } from '../../books/dto';
import { getReadBookKeyboard, languageInlineKeyboard } from '@core/telegram';
import { ConfigService } from '@nestjs/config';
import { Actions } from '@core/telegram/actions';
import { getLanguageByCode, getTextByLanguageCode } from '@core/utils';
import { UsersService } from '../../users/users.service';

@Update()
export class ActionsUpdate {
  constructor(
    private readonly booksService: BooksService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @Action(/demo_page_+/)
  async getDemoPage(ctx: MainUpdateContext) {
    const { callback_query: callbackQuery } =
      ctx.update as TelegrafUpdate.CallbackQueryUpdate;

    const [, , bookId, page] = (callbackQuery as any).data.split('_');

    const chunk = await this.booksService.getPageByBookId(
      +bookId,
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
      +bookId,
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
