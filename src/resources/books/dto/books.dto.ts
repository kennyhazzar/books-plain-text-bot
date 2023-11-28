export class CreateBookDto {
  title: string;
  author?: string;
  bookText: string;
}

export class CreateBooksChunkDto {
  book: { id: number };
  text: string;
  index: number;
}
