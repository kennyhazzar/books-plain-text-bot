import { registerAs, ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';
import {
  CommonConfigs,
  DatabaseConfigs,
  RedisConfigs,
  TelegrafConfigs,
} from '../types';

const common = registerAs<CommonConfigs>('common', () => ({
  port: +process.env.PORT,
  appUrl: process.env.APP_URL,
}));

const telegram = registerAs<TelegrafConfigs>('tg', () => ({
  token: process.env.BOT_TOKEN,
  url: process.env.BOT_URL,
}));

const database = registerAs<DatabaseConfigs>('db', () => ({
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}));

const redis = registerAs<RedisConfigs>('redis', () => ({
  host: process.env.REDIS_HOST,
  port: +process.env.REDIS_PORT,
}));

export const EnvConfig: ConfigModuleOptions = {
  envFilePath: '.env',
  isGlobal: true,
  validationSchema: Joi.object({
    PORT: Joi.string().required(),
    APP_URL: Joi.string().required(),
    BOT_TOKEN: Joi.string().required(),
    BOT_URL: Joi.string().required(),
    DB_TYPE: Joi.string().required(),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.number().required(),
  }),
  load: [common, database, telegram, redis],
};
