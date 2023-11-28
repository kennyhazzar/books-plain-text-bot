import { NestFactory } from '@nestjs/core';
import { AppModule } from '@resources/app.module';
import { ConfigService } from '@nestjs/config';
import { CommonConfigs } from '@core/types';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  const { port } = app.get(ConfigService).get<CommonConfigs>('common');

  await app.listen(port, async () =>
    console.log(`app was running on ${await app.getUrl()}`),
  );
}
bootstrap();
