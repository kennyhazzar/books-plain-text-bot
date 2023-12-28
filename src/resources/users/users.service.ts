import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InsertUserDto, UpdateTelegramProfileDto } from './dto/user.dto';
import { generateId } from '@core/utils';
import { LanguageCode } from '@core/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  public async insert(user: InsertUserDto): Promise<User> {
    const apiKey = generateId(15);

    const insertedUser = await this.userRepository.save({
      ...user,
      apiKey,
    });

    return insertedUser;
  }

  public async updateTelegramProfile(
    user: User,
    newProfile: UpdateTelegramProfileDto,
  ) {
    await this.userRepository.save({
      ...user,
      ...newProfile,
    });
  }

  public async updateLanguage(user: User, languageCode: LanguageCode) {
    await this.userRepository.save({
      ...user,
      languageCode,
    });
  }

  public async updateToken(user: User): Promise<string> {
    const apiKey = generateId(15);
    await this.userRepository.save({
      ...user,
      apiKey,
    });

    return apiKey;
  }

  public async getByTelegramId(telegramId: number): Promise<User> {
    return this.userRepository.findOne({
      where: { telegramId },
    });
  }

  public async getByApiKey(apiKey: string) {
    return this.userRepository.findOne({
      where: { apiKey },
    });
  }
}
