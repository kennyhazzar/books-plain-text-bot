import { BooksChunk } from '@resources/books/entities';
import { LanguageCode, Target } from '../types';
import { texts } from '@core/constants';

type Chunk = { chunk: string; index: number };
type SplitResult = { chunks: Array<Chunk>; totalIndex: number };

export function splitEveryN(str: string, n = 4096): SplitResult {
  const chunks: Array<Chunk> = [];
  let chunkIndex = 1;

  for (let index = 0; index < str.length; index += n) {
    chunks.push({ chunk: str.slice(index, index + n), index: chunkIndex });
    chunkIndex++;
  }

  return { chunks, totalIndex: chunkIndex };
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const generateId = (
  length = 10,
  dict = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
) => {
  const a = dict.split('');
  const token = [];
  for (let i = 0; i < length; i++) {
    const instance = (Math.random() * (a.length - 1)).toFixed(0);
    token[i] = a[instance];
  }
  return token.join('');
};

export const joinBookText = (chunks: Array<BooksChunk>) => {
  return chunks.map(({ text }) => text).join();
};

export const getTextByLanguageCode = (
  languageCode: LanguageCode,
  userTarget: Target,
  wordsToReplace?: Record<string, string>,
): string => {
  let result: string;

  if (languageCode === 'ru') {
    result = texts.find(({ target }) => target === userTarget).ru;
  } else {
    result = texts.find(({ target }) => target === userTarget).en;
  }

  if (wordsToReplace) {
    for (const definition in wordsToReplace) {
      result = result.replace(`%${definition}%`, wordsToReplace[definition]);
    }
  }

  return result;
};

export const getLanguageByCode = (languageCode: LanguageCode) => {
  const texts: Record<LanguageCode, { ru: string; en: string }> = {
    ru: { ru: 'Русский', en: 'Russian' },
    en: { ru: 'Английский', en: 'English' },
  };

  return texts[languageCode];
};
