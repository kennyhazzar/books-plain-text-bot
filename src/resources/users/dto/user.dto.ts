export class InsertUserDto {
  telegramId: number;
  username?: string;
  firstName?: string;
  secondName?: string;
  apiKey?: string;
  languageCode?: string;
  md5?: string;
}

export class UpdateTelegramProfileDto {
  username?: string;
  firstName?: string;
  secondName?: string;
  md5?: string;
}
