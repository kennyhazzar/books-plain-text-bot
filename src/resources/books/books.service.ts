import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book, BooksChunk } from './entities';
import { Repository } from 'typeorm';
import { CreateBookDto, CreateBooksChunkDto } from './dto';
import { splitEveryN } from '../../core/utils';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
    @InjectRepository(BooksChunk)
    private readonly bookChunkRepository: Repository<BooksChunk>,
  ) {}

  async createBook(payload: CreateBookDto): Promise<number> {
    const chunks = splitEveryN(payload.bookText);

    const { raw } = await this.bookRepository.insert({
      author: payload?.author,
      title: payload.title,
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
  ): Promise<{
    text: string | undefined;
    title: string | undefined;
    bookId: number | undefined;
  } | null> {
    const chunk = await this.bookChunkRepository.findOne({
      where: {
        book: {
          id,
        },
        index: page,
      },
      relations: ['book'],
    });

    if (!chunk) {
      return null;
    }

    return {
      text: chunk.text,
      title: chunk.book.title,
      bookId: chunk.book.id,
    };
  }
}
