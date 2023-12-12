import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { Actions } from '../actions';

const getNavigationInlineButton = (
  bookId: number,
  currentPage: number,
  action: 'prev' | 'next',
): InlineKeyboardButton => {
  return {
    text: action === 'prev' ? '<' : '>',
    callback_data: `${Actions.PAGE}${bookId}_${
      action === 'prev' ? currentPage - 1 : currentPage + 1
    }`,
  };
};

export const getReadBookKeyboard = (
  currentPage: number,
  totalPage: number,
  bookId: number,
  url: string,
): InlineKeyboardButton[][] => {
  const keyboard: InlineKeyboardButton[][] = [
    [
      {
        text: `${currentPage} / ${totalPage}`,
        url,
      },
    ],
    [
      {
        text: 'Закрыть',
        callback_data: Actions.CLOSE_BOOK,
      },
    ],
  ];

  if (currentPage !== 1) {
    keyboard[0].unshift(getNavigationInlineButton(bookId, currentPage, 'prev'));
  }

  if (currentPage !== totalPage) {
    keyboard[0].push(getNavigationInlineButton(bookId, currentPage, 'next'));
  }

  return keyboard;
};
