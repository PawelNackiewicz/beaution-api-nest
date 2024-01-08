import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { configure } from './config.main';
import * as CookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.use(CookieParser('secret'));
  const configService = app.get(ConfigService);
  configure(app);
  await app.listen(configService.get('PORT'));
}
bootstrap();
