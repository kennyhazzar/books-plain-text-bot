import { BaseEntity } from '@core/db';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Book } from './books.entity';

@Entity()
export class BooksChunk extends BaseEntity {
  @Column()
  @Index()
  index: number;

  @Column()
  text: string;

  @ManyToOne(() => Book, (book) => book.id)
  book: Book;
}
