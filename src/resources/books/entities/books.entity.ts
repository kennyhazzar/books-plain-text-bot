import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@core/db';
import { BooksChunk } from './books-chunk.entity';
import { User } from '@resources/users/entities';

@Entity()
export class Book extends BaseEntity {
  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ default: 1 })
  lastIndex: number;

  @Column()
  totalIndex: number;

  @OneToMany(() => BooksChunk, (chunk) => chunk.id)
  chunks: BooksChunk[];

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;
}
