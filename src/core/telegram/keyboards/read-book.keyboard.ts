import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { Actions } from '../actions';

export const getReadBookKeyboard = (
  currentPage: number,
  totalPage: number,
  bookId: number,
): InlineKeyboardButton[][] => [
  [
    {
      text: '<',
      callback_data: `${Actions.BACK}${bookId}_${currentPage - 1}`,
    },
    {
      text: `${currentPage} / ${totalPage}`,
      // url: book.continousLink,
      url: 'vk.com',
    },
    {
      text: '>',
      callback_data: `${Actions.NEXT}${bookId}_${currentPage + 1}`,
    },
  ],
];
