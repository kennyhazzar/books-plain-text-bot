import { User } from '@resources/users/entities';

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
}

export class GetChunkDto {
  text: string;
  title: string;
  bookId: number;
  currentPage: number;
  totalPage: number;
}
