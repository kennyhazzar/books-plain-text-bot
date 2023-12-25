import { User } from '@resources/users/entities';
import { LanguageCode } from '@core/types';

export class CreateBookDto {
  title: string;
  author?: string;
  bookText: string;
  user: User;
}

export class CreateBooksChunkDto {
  book: { id: number };
  text: string;
  index: number;
}

export class GetBookDto {
  id: number;
  index?: number;
  title: string;
  author: string;
  begginLink: string;
  continousLink: string;
  currentPage: number;
  totalPage: number;
  fileName?: string;
  percent?: string;
  begginText?: string;
  continousText?: string;
}

export class GetChunkDto {
  text: string;
  title: string;
  bookId: number;
  currentPage: number;
  totalPage: number;
  userLanguageCode: LanguageCode;
}
