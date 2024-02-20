import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
  ) {}
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
    return await this.userService.createUser(createUserDto);
    // await this.prepareConfirmation(user);
  }

  // async prepareConfirmation(userEmail: string): Promise<void> {
  //   const token = await this.tokenService.getActivationToken(userEmail);
  //   const confirmLink = `${this.clientAppUrl}/auth/confirm?token=${token}`;
  //   await this.mailService.sendConfirmationMail(user, confirmLink);
  // }

  //   async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
  //     const user = await this.userService.findByEmail(forgotPasswordDto.email);
  //     if (!user) return;
  //     const token = await this.tokenService.getActivationToken(user.email);
  //     const forgotLink = `${this.clientAppUrl}/auth/resetPassword?token=${token}`;
  //     await this.mailService.sendForgotPasswordMail(user, forgotLink);
  //   }

  //   async changePassword(
  //     userId: string,
  //     changePasswordDto: ChangePasswordDto,
  //   ): Promise<boolean> {
  //     const password = await this.userService.hashPassword(
  //       changePasswordDto.password,
  //     );

  //     await this.userService.update(userId, { password });
  //     await this.tokenService.deleteAll(userId);
  //     return true;
  //   }

  //   async changePasswordByToken(
  //     changePasswordDto: ChangePasswordDto,
  //   ): Promise<boolean> {
  //     const password = await this.userService.hashPassword(
  //       changePasswordDto.password,
  //     );
  //     const data = (await this.tokenService.verifyActivationToken(
  //       AuthService.parseToken(changePasswordDto.token),
  //     )) as ITokenPayload;
  //     const user = await this.userService.findByEmail(data.userEmail);
  //     console.log(user);

  //     await this.userService.update(user._id, { password });
  //     await this.tokenService.deleteAll(user._id);
  //     return true;
  //   }

  //   async confirmUser({ token }: ConfirmAccountDto) {
  //     const data = await this.tokenService.verifyActivationToken(token);
  //     const user = await this.userService.findUserByLogin(data.userEmail);

  //     if (user && user.status === statusEnum.pending) {
  //       user.status = statusEnum.active;
  //       return user.save();
  //     }
  //     throw new NotFoundException('Confirmation error');
  //   }
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
