import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { Actions } from '../actions';

const getNavigationInlineButton = (
  bookId: number,
  currentPage: number,
  action: Actions,
): InlineKeyboardButton => {
  return {
    text: action === Actions.BACK ? '<' : '>',
    callback_data: `${action}${bookId}_${
      action === Actions.BACK ? currentPage - 1 : currentPage + 1
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
    keyboard[0].unshift(
      getNavigationInlineButton(bookId, currentPage, Actions.BACK),
    );
  }

  if (currentPage !== totalPage) {
    keyboard[0].push(
      getNavigationInlineButton(bookId, currentPage, Actions.NEXT),
    );
  }

  console.log(keyboard);

  return keyboard;
};
