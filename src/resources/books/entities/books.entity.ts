import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BooksChunk } from './books-chunk.entity';
import { User } from '@resources/users/entities';

@Entity()
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

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
