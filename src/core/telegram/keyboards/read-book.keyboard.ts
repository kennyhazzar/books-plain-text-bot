import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { Actions } from '../actions';
import { Chars, LanguageCode } from '../../types';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { getTextByLanguageCode } from '../../utils';

const getNavigationInlineButton = (
  bookId: string,
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
  percent: string,
  bookId: string,
  url: string,
  languageCode: LanguageCode,
): InlineKeyboardButton[][] => {
  const keyboard: InlineKeyboardButton[][] = [
    [
      {
        text: `${currentPage} / ${totalPage} ${percent}`,
        url,
      },
    ],
    [
      {
        text: getTextByLanguageCode(languageCode, 'book_menu_label'),
        callback_data: `${Actions.MENU_BOOK}${bookId}`,
      },
    ],
    [
      {
        text: getTextByLanguageCode(languageCode, 'menu_particle'),
        callback_data: `${Actions.MENU_PAGE}1`,
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

export const languageMenu = (
  languageCode: LanguageCode,
): ExtraReplyMessage => ({
  reply_markup: {
    inline_keyboard: languageInlineKeyboard(languageCode),
  },
});

export const languageInlineKeyboard = (
  languageCode: LanguageCode,
): InlineKeyboardButton[][] => [
  [
    {
      text: getLanguageButtonText(
        languageCode,
        'ru',
        getLanguageByCode('ru')[languageCode],
      ),
      callback_data: `${Actions.SET_LANGUAGE}ru`,
    },
  ],
  [
    {
      text: getLanguageButtonText(
        languageCode,
        'en',
        getLanguageByCode('en')[languageCode],
      ),
      callback_data: `${Actions.SET_LANGUAGE}en`,
    },
  ],
];

const getLanguageButtonText = (
  languageCode: LanguageCode,
  targetLanguageCode: LanguageCode,
  text: string,
) => {
  const dot = languageCode === targetLanguageCode ? Chars.DOT : '';

  return `${dot} ${text} ${dot}`;
};

export const getLanguageByCode = (languageCode: LanguageCode) => {
  const texts: Record<LanguageCode, { ru: string; en: string }> = {
    ru: { ru: 'Русский', en: 'Russian' },
    en: { ru: 'Английский', en: 'English' },
  };

  return texts[languageCode];
};
