import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { Actions } from '../actions';

export const getReadBookKeyboard = (
  currentPage: number,
  totalPage: number,
  bookId: number,
  url: string,
): InlineKeyboardButton[][] => [
  [
    {
      text: '<',
      callback_data: `${Actions.BACK}${bookId}_${currentPage - 1}`,
    },
    {
      text: `${currentPage} / ${totalPage}`,
      url,
    },
    {
      text: '>',
      callback_data: `${Actions.NEXT}${bookId}_${currentPage + 1}`,
    },
  ],
];
