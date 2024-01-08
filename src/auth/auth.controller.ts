import {
  Body,
  Controller,
  Post,
  ValidationPipe,
  Req,
  Get,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CookieService } from 'src/cookie/cookie.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Post('users')
  async registration(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('sessions')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body(new ValidationPipe()) loginDto: LoginDto,
  ) {
    const accessToken = await this.authService.login(loginDto);
    this.cookieService.setTokenInCookies(res, accessToken);
    return accessToken;
  }

  @Get('sessions/me')
  async getProfile(@Req() req: Request) {
    return await this.authService.getUserInfo(req.cookies.token);
  }
}
