import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { Chars } from '../../types';
import { chunkSizes } from '../../constants';
import { Actions } from '../actions';

export const getChunkSettingsKeyboard = (
  currentSize: number,
): InlineKeyboardButton[][] => {
  const keyboard: InlineKeyboardButton[][] = [];

  for (let index = 0; index < chunkSizes.length; index++) {
    const size = chunkSizes[index];

    keyboard.push([
      {
        text:
          currentSize === size
            ? `${Chars.DOT} ${size} ${Chars.DOT}`
            : `${size}`,
        callback_data: `${Actions.SET_CHUNK}${size}`,
      },
    ]);
  }

  return keyboard;
};
