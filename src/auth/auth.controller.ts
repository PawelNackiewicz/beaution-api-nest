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
  HttpCode,
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
  @ApiResponse({ status: 409, description: 'Conflict' })
  async registration(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('sessions')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body(new ValidationPipe()) loginDto: LoginDto,
  ) {
    const accessToken = await this.authService.login(loginDto);
    this.cookieService.setTokenInCookies(res, accessToken);
    return accessToken;
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Res({ passthrough: true }) res: Response) {
    this.cookieService.clearTokenInCookies(res);
    return { message: 'Logout successful' };
  }

  @Get('sessions/me')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getProfile(@Req() req: Request) {
    return await this.authService.getUserInfo(req.cookies.token);
  }

  @Post('users/password/reset')
  @ApiOperation({ summary: 'Forgot password' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async forgotPassword(
    @Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Get('users/confirm')
  @ApiOperation({ summary: 'Confirm account' })
  @ApiResponse({ status: 200, description: 'Account confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async confirm(@Query(new ValidationPipe()) query: ConfirmAccountDto) {
    return await this.authService.confirmUser(query);
  }

  @Patch('users/:userId/password')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @Body(new ValidationPipe()) changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePasswordByToken(changePasswordDto);
  }
}
