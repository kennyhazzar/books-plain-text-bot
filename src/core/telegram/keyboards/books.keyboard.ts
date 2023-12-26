import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { GetBookDto } from '@resources/books/dto';
import { Actions } from '../actions';
import { LanguageCode } from '../../types';
import { getTextByLanguageCode } from '../../utils';

const getNavigationInlineButton = (
  currentPage: number,
  action: 'prev' | 'next',
): InlineKeyboardButton => {
  return {
    text: action === 'prev' ? '<' : '>',
    callback_data: `${Actions.MENU_PAGE}${
      action === 'prev' ? currentPage - 1 : currentPage + 1
    }`,
  };
};

export const getBooksKeyboard = (
  books: GetBookDto[],
  currentPage: number,
  totalPage: number,
): InlineKeyboardButton[][] => {
  const keyboard: InlineKeyboardButton[][] = [];
  const navigation: InlineKeyboardButton[] = [
    {
      text: '🔄',
      callback_data: `${Actions.MENU_PAGE}${currentPage}`,
    },
  ];

  for (const book of books) {
    keyboard.push([
      {
        text: `${book.title}`,
        callback_data: `${Actions.MENU_BOOK}${book.id}`,
      },
    ]);
  }

  if (currentPage !== 1) {
    navigation.unshift(getNavigationInlineButton(currentPage, 'prev'));
  }

  if (currentPage !== totalPage) {
    navigation.push(getNavigationInlineButton(currentPage, 'next'));
  }

  return [...keyboard, navigation];
};

export const getOneBookMenuKeyboard = (
  bookId: string,
  languageCode: LanguageCode,
  bookUrl: string,
): InlineKeyboardButton[][] => [
  [
    {
      text: getTextByLanguageCode(languageCode, 'book_menu_read_chat'),
      callback_data: `${Actions.BOOK_MENU_READ_CHAT}${bookId}`,
    },
  ],
  [
    {
      text: getTextByLanguageCode(languageCode, 'book_menu_read_web'),
      url: bookUrl,
    },
  ],
  [
    {
      text: getTextByLanguageCode(languageCode, 'book_menu_delete'),
      callback_data: `${Actions.BOOK_MENU_DELETE}${bookId}`,
    },
  ],
  [
    {
      text: getTextByLanguageCode(languageCode, 'book_menu_download'),
      callback_data: `${Actions.BOOK_MENU_DOWNLOAD}${bookId}`,
    },
  ],
  [
    {
      text: getTextByLanguageCode(languageCode, 'menu_particle'),
      callback_data: `${Actions.MENU_PAGE}1`,
    },
  ],
];
