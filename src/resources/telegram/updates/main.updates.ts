import { Command, On, Update, Use } from 'nestjs-telegraf';
import { Document, Message } from 'telegraf/typings/core/types/typegram';
import { formatBytes, getBufferFromUrl } from '@core/utils';
import { BooksService } from '@resources/books/books.service';
import { ConfigService } from '@nestjs/config';
import { CommonConfigs, MainUpdateContext } from '@core/types';
import { UsersService } from '../../users/users.service';
import { User } from '@resources/users/entities';
import { getReadBookKeyboard } from '../../../core/telegram';

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

  @Command('read')
  async readBookInChat(ctx: MainUpdateContext) {
    const message = ctx.message as Message.TextMessage;

    if (message.text === '/read') {
      ctx.reply(
        'Синтаксис команды: /read <book-id>, где book-id: идентификатор книги (целое число).\nПример: /read 1\n\nЕсли книга найдена, вы получите текущую страницу и кнопки навигации',
      );

      return;
    }

    const [, bookId] = message.text.split(' ');

    if (!Number.isNaN(+bookId)) {
      const apiKey = ctx.state.user.apiKey;
      const book = await this.booksService.getBookById(+bookId, apiKey);

      if (!book) {
        ctx.reply('Книга не была найдена!');

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
            chunk.bookId,
            book.continousLink,
          ),
        },
      });
    } else {
      ctx.reply('Проверьте ваш айди. Кажется, он не является целым числом');
    }
  }

  @Command('link')
  async getLink(ctx: MainUpdateContext) {
    const { appUrl } = this.configService.get<CommonConfigs>('common');

    ctx.reply(`Ссылка на список книг: ${appUrl}?k=${ctx.state.user.apiKey}`);
  }

  @Command('delete')
  async deleteBook(ctx: MainUpdateContext) {
    const message = ctx.message as Message.TextMessage;

    if (message.text === '/delete') {
      ctx.reply(
        'Синтаксис команды: /delete <book-id>, где book-id: идентификатор книги.\nПример: /delete 1',
      );

      return;
    }

    const [, bookId] = message.text.split(' ');

    const { result: isDelete, book } = await this.booksService.deleteBookById(
      +bookId,
      ctx.state.user.apiKey,
    );

    if (!isDelete) {
      ctx.reply('Ошибка при удалении! Нужно смотреть в консоль');

      return;
    }

    ctx.reply(
      `Книга \`${book.title}\` автора \`${book.author}\` была удалена`,
      {
        parse_mode: 'Markdown',
      },
    );
  }

  @On('document')
  async getBook(ctx: MainUpdateContext) {
    const user = ctx.state.user;

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
        `Файл слишком велик. Ваш лимит: ${formatBytes(
          user.fileSizeLimit,
        )}; Размер файла: ${formatBytes(
          fileSize,
        )}\nЧтобы увеличить лимит, напишите разработчику: @kennyhazzar`,
      );

      return;
    }

    const booksCount = await this.booksService.getBooksCountByTelegramId(
      user.telegramId,
    );

    if (user.booksLimit <= booksCount) {
      ctx.reply(
        'Вы достигли максимума книг на ваш аккаунт! Чтобы увеличить лимит, напишите разработчику: @kennyhazzar',
      );

      return;
    }

    if (fileName.endsWith('.txt')) {
      const messageReplyResult = await ctx.reply(
        `Начинаю обработку...\n(Название книги: ${fileName}; Автор: ${author})`,
      );
      processMessageId = messageReplyResult.message_id;

      try {
        const link = await ctx.telegram.getFileLink(fileId);

        fileUrl = link.href;
      } catch (error) {
        console.log(error);
        ctx.deleteMessage(processMessageId);
        await ctx.reply('Ошибка:( Хз, нужно в консоль смотреть.');

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
        await ctx.reply('Ошибка:( Хз, нужно в консоль смотреть.');

        return;
      }
    } else {
      ctx.reply('Я жду .txt файл ващето');
    }
  }

  @On('text')
  async onText(ctx: MainUpdateContext) {
    ctx.reply(
      `Используйте команду /link для получения ссылки на список ваших книг.\nОтправьте мне книгу в txt формате, и я выдам вам ссылку на книгу. Удалить книгу можно с помощью команды /delete, вызовите эту команду для получения информации\n\nВы также можете читать книги в чате бота! Используйте команду /read для получения информации`,
    );
  }

  private async checkUser(ctx: MainUpdateContext): Promise<User | null> {
    let user = await this.usersService.getByTelegramId(ctx.chat.id);

    if (!user) {
      user = await this.usersService.insert({
        telegramId: ctx.chat.id,
        username: ctx.from?.username,
        firstName: ctx.from?.first_name,
        secondName: ctx.from?.last_name,
      });

      ctx.reply(
        `Вы зарегистрировались, ваш токен: \`${user.apiKey}\`. Используйте команду /link для получения ссылки на список ваших книг.\nОтправьте мне книгу в txt формате, и я выдам вам ссылку на книгу. Удалить книгу можно с помощью команды /delete, вызовите эту команду для получения информации\n\nВы также можете читать книги в чате бота! Используйте команду /read для получения информации`,
        {
          parse_mode: 'Markdown',
        },
      );
    }

    if (user.isBlocked) {
      return;
    }

    return user;
  }
}
