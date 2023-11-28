import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '@core/db';
import { BooksChunk } from './books-chunk.entity';

@Entity()
export class Book extends BaseEntity {
  @Column()
  title: string;

  @Column()
  author: string;

  @OneToMany(() => BooksChunk, (chunk) => chunk.id)
  chunks: BooksChunk[];
}
