import {
  Body,
  Controller,
  Post,
  ValidationPipe,
  Req,
  Get,
  Res,
  Query,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CookieService } from 'src/cookie/cookie.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Request, Response } from 'express';
import {
  ChangePasswordDto,
  ConfirmAccountDto,
  ForgotPasswordDto,
  LoginDto,
} from './dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Post('users')
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async registration(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('sessions')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body(new ValidationPipe()) loginDto: LoginDto,
  ) {
    const accessToken = await this.authService.login(loginDto);
    this.cookieService.setTokenInCookies(res, accessToken);
    return accessToken;
  }

  @Get('sessions/me')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: Request) {
    return await this.authService.getUserInfo(req.cookies.token);
  }

  @Post('/forgotPassword')
  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async forgotPassword(
    @Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Get('/confirm')
  @ApiOperation({ summary: 'Confirm account' })
  @ApiResponse({ status: 200, description: 'Account confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async confirm(@Query(new ValidationPipe()) query: ConfirmAccountDto) {
    return await this.authService.confirmUser(query);
  }

  @Patch('/changePassword')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async changePassword(
    @Body(new ValidationPipe()) changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePasswordByToken(changePasswordDto);
  }
}
