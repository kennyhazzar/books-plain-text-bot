import { Column, Entity, Index, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@core/db';
import { Book } from '@resources/books/entities';

@Entity()
export class User extends BaseEntity {
  @Index()
  @Column({ unique: true, type: 'bigint' })
  telegramId: number;

  @Column({ nullable: true, unique: true })
  username: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  secondName: string;

  @Column({ default: false })
  isBlocked: boolean;

  @Column()
  apiKey: string;

  @JoinColumn()
  @OneToMany(() => Book, (book) => book.id)
  books: Book[];
}