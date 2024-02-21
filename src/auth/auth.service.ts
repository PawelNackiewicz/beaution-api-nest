import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  LoginDto,
  ChangePasswordDto,
  ConfirmAccountDto,
  ForgotPasswordDto,
} from './dto';
import * as bcrypt from 'bcrypt';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ConfigService } from 'src/config/config.service';
import { MailService } from 'src/mail/mail.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly clientAppUrl: string;

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {
    this.clientAppUrl = this.configService.get('CLIENT_URL');
  }
  // ✅
  async login({ login, password }: LoginDto) {
    const user = await this.userService.findUserByLogin(login);
    const correctCredentials =
      user && (await bcrypt.compare(password, user.password));

    if (correctCredentials) {
      return await this.tokenService.signUser(user);
    }
    throw new UnauthorizedException('Invalid credentials');
  }
  // ✅
  async register(createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    await this.prepareConfirmation(user);
  }

  async prepareConfirmation(
    user: Pick<User, 'id' | 'login' | 'status' | 'firstName'>,
  ): Promise<void> {
    const token = await this.tokenService.getActivationToken(
      user.id.toString(),
      user.login,
    );
    const confirmLink = `${this.clientAppUrl}/auth/confirm?token=${token}`;
    await this.mailService.sendConfirmationMail(user, confirmLink);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.userService.findUserByLogin(
      forgotPasswordDto.email,
    );
    if (!user) return;
    const token = await this.tokenService.getActivationToken(
      user.id.toString(),
      user.login,
    );
    const forgotLink = `${this.clientAppUrl}/auth/resetPassword?token=${token}`;
    await this.mailService.sendForgotPasswordMail(user, forgotLink);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<boolean> {
    const password = await this.userService.hashPassword(
      changePasswordDto.password,
    );

    await this.userService.updateUser({
      data: { password },
      where: { id: parseInt(userId) },
    });
    await this.tokenService.deleteAll(parseInt(userId));
    return true;
  }

  async confirmUser({ token }: ConfirmAccountDto) {
    const userId = await this.tokenService.verifyActivationToken(token);
    const user = await this.userService.findUserById(userId);
    if (user && user.status === 'PENDING') {
      return this.userService.updateUser({
        data: { status: 'ACTIVE' },
        where: { id: userId },
      });
    }
    throw new NotFoundException('Confirmation error');
  }
  // ✅
  async getUserInfo(token: string) {
    const userId = await this.tokenService.getUserId(
      AuthService.parseToken(token),
    );
    return await this.userService.findUserById(userId);
  }
  // ✅
  private static parseToken(token: string) {
    const prefix = 'token=';
    if (token.includes(prefix)) return token.split(prefix).pop();
    return token;
  }
}
