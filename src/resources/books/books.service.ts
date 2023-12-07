import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book, BooksChunk } from './entities';
import { Repository } from 'typeorm';
import { CreateBookDto, CreateBooksChunkDto } from './dto';
import { splitEveryN } from '../../core/utils';
import { ConfigService } from '@nestjs/config';
import { CommonConfigs } from '@core/types';
import { UsersService } from '@resources/users/users.service';
import { User } from '@resources/users/entities';

@Injectable()
export class BooksService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
    @InjectRepository(BooksChunk)
    private readonly bookChunkRepository: Repository<BooksChunk>,
  ) {}

  async createBook(payload: CreateBookDto): Promise<number> {
    const { chunks, totalIndex } = splitEveryN(payload.bookText);

    const { raw } = await this.bookRepository.insert({
      author: payload?.author,
      title: payload.title,
      totalIndex,
      user: payload.user,
    });

    const insertedBookId = +raw[0]?.id;

    const chunksToInsert: CreateBooksChunkDto[] = chunks.map(
      ({ chunk: text, index }) => ({
        book: { id: insertedBookId },
        index,
        text,
      }),
    );

    await this.bookChunkRepository.insert(chunksToInsert);

    return insertedBookId;
  }

  async getPageByBookId(
    id: number,
    page: number,
    apiKey: string,
  ): Promise<{
    text: string;
    title: string;
    bookId: number;
    currentPage: number;
    totalPage: number;
  } | null> {
    const chunk = await this.bookChunkRepository.findOne({
      where: {
        book: {
          id,
          user: {
            apiKey,
          },
        },
        index: page,
      },
      relations: ['book', 'book.user'],
    });

    if (!chunk) {
      return null;
    }

    if (page !== chunk.book.lastIndex) {
      await this.bookRepository.update(id, {
        lastIndex: page,
      });
    }

    return {
      text: chunk.text,
      title: chunk.book.title,
      bookId: chunk.book.id,
      currentPage: page,
      totalPage: chunk.book.totalIndex,
    };
  }

  async getAll(apiKey: string) {
    const result = [];

    const { appUrl } = this.configService.get<CommonConfigs>('common');

    const books = await this.bookRepository.find({
      where: {
        user: {
          apiKey,
        },
      },
      order: {
        updatedAt: 'DESC',
      },
      relations: ['user'],
    });

    let user: User;

    if (books.length > 0) {
      user = books[0].user;
    }

    const apiKeyParam = `?k=${apiKey}`;

    for (let index = 0; index < books.length; index++) {
      const book = books[index];
      result.push({
        id: book.id,
        index: index + 1,
        title: book.title,
        author: book.author,
        begginLink: `${appUrl}/r/${book.id}/1${apiKeyParam}`,
        continousLink: `${appUrl}/r/${book.id}/${book.lastIndex}${apiKeyParam}`,
        currentPage: book.lastIndex,
        totalPage: book.totalIndex,
      });
    }

    return {
      result,
      userName: user
        ? `${
            user.firstName && user.secondName && user.username
              ? `пользователя ${user.firstName} ${user.secondName} (${user.username})`
              : `${user.username}`
          }`
        : 'Ошибка авторизации',
    };
  }

  async deleteBookById(
    id: number,
    apiKey: string,
  ): Promise<{ book: Book | null; result: boolean }> {
    const book = await this.bookRepository.findOne({
      where: {
        id,
        user: {
          apiKey,
        },
      },
      relations: ['user'],
    });

    if (!book) {
      return {
        book,
        result: false,
      };
    }

    try {
      await this.bookChunkRepository.delete({
        book: {
          id,
        },
      });

      await this.bookRepository.delete({
        id: book.id,
      });

      return {
        book,
        result: true,
      };
    } catch (error) {
      console.log(error);

      return {
        book,
        result: false,
      };
    }
  }
}
