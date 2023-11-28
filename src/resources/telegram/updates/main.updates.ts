import { On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { Document } from 'telegraf/typings/core/types/typegram';
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

  @On('document')
  async getBook(ctx: Context) {
    let processMessageId: number;
    let fileUrl = '';

    const { file_name: fileName, file_id: fileId } = (ctx.message as any)
      .document as Document;

    if (fileName.endsWith('.txt')) {
      const messageReplyResult = await ctx.reply('Начинаю обработку...');
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
          title: 'sample test',
          bookText: source.toString(),
          author: 'sample text author',
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
