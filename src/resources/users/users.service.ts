import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InsertUserDto, UpdateTelegramProfileDto } from './dto/user.dto';
import { generateId } from '@core/utils';
import { LanguageCode } from '@core/types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async insert(user: InsertUserDto): Promise<User> {
    const apiKey = generateId(15);

    const insertedUser = await this.userRepository.save({
      ...user,
      apiKey,
    });

    await this.cacheManager.set(
      `book_user_${insertedUser.telegramId}`,
      insertedUser,
    );

    return insertedUser;
  }

  public async updateTelegramProfile(
    user: User,
    newProfile: UpdateTelegramProfileDto,
  ) {
    const updatedUser = await this.userRepository.save({
      ...user,
      ...newProfile,
    });

    await this.cacheManager.set(`book_user_${user.telegramId}`, updatedUser);
  }

  public async updateLanguage(user: User, languageCode: LanguageCode) {
    const updatedUser = await this.userRepository.save({
      ...user,
      languageCode,
    });

    await this.cacheManager.set(`book_user_${user.telegramId}`, updatedUser);
  }

  public async updateToken(user: User): Promise<string> {
    const apiKey = generateId(15);
    const updatedUser = await this.userRepository.save({
      ...user,
      apiKey,
    });

    await this.cacheManager.set(`book_user_${user.telegramId}`, updatedUser);

    return apiKey;
  }

  public async getByTelegramId(telegramId: number): Promise<User> {
    const cacheKey = `book_user_${telegramId}`;

    let user = await this.cacheManager.get<User>(cacheKey);

    if (!user) {
      user = await this.userRepository.findOne({
        where: { telegramId },
      });

      if (user) {
        await this.cacheManager.set(cacheKey, user);
      }
    }

    return user;
  }

  public async getByApiKey(apiKey: string) {
    return this.userRepository.findOne({
      where: { apiKey },
    });
  }
}
