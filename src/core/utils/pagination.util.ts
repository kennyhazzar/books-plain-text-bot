import { Page } from '../types';

export const getPagesCount = (
  booksCount: number,
  size: number,
  baseUrl: string,
): Array<Page> => {
  let pagesCount = 0;
  const pages: Array<Page> = [];

  pagesCount = Math.floor(booksCount / size);
  const remainder = booksCount % size;

  if (remainder !== 0) pagesCount += 1;

  for (let index = 0; index < pagesCount; index++) {
    pages.push({ index: index + 1, url: `${baseUrl}&p=${index + 1}` });
  }

  return pages;
};
