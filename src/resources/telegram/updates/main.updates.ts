import { Command, On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { Document, Message } from 'telegraf/typings/core/types/typegram';
import { getBufferFromUrl } from '@core/utils';
import { BooksService } from '@resources/books/books.service';
import { ConfigService } from '@nestjs/config';
import { CommonConfigs } from '@core/types';

@Update()
export class MainUpdate {
  constructor(
    private readonly booksService: BooksService,
    private readonly configService: ConfigService,
  ) {}

  @Command('delete')
  async deleteBook(ctx: Context) {
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
  async getBook(ctx: Context) {
    let processMessageId: number;
    let fileUrl = '';

    const { file_name: fileName, file_id: fileId } = (ctx.message as any)
      .document as Document;
    const author = ((ctx.message as any)?.caption as string) || 'noname';

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
        });

        const { appUrl } = this.configService.get<CommonConfigs>('common');

        ctx.deleteMessage(processMessageId);

        await ctx.reply(`\`${appUrl}/r/${bookId}/1\``, {
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
}
