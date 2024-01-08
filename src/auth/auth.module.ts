import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { TokenModule } from 'src/token/token.module';
import { CookieModule } from 'src/cookie/cookie.module';

@Module({
  imports: [UserModule, TokenModule, CookieModule],
  providers: [AuthService, PrismaService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
