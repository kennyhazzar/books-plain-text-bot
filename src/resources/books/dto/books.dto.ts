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
