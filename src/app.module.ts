import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TokenModule } from './token/token.module';
import { CookieModule } from './cookie/cookie.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from './config/config.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.register({ folder: './config' }),
    AuthModule,
    TokenModule,
    CookieModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
