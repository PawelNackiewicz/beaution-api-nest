import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma.service';
import type { User } from '@prisma/client';
import * as moment from 'moment';
// import * as jose from 'jose';

@Injectable()
export class TokenService {
  constructor(private prisma: PrismaService) {}
  async getActivationToken(login: string) {
    //to implement
    return login;
  }

  async signUser(user: User, withStatusCheck: boolean = true) {
    if (withStatusCheck && user.status !== 'ACTIVE') {
      throw new UnauthorizedException();
    }
    const token = await TokenService.generateToken();
    const expireAt = moment().add(1, 'day').toISOString();

    await this.prisma.token.create({
      data: { token, expireAt, userId: user.id },
    });

    return token;
  }

  private static async generateToken() {
    return crypto.randomBytes(48).toString('hex');
  }

  async verifyActivationToken(token: string) {
    //to implement
    return token;
  }

  async delete(userId: User['id'], token: string) {
    try {
      await this.prisma.token.delete({ where: { userId, token } });
      return true;
    } catch (e) {
      return false;
    }
  }

  async deleteAll(userId: User['id']) {
    try {
      await this.prisma.token.deleteMany({ where: { userId } });
      return true;
    } catch (e) {
      return false;
    }
  }

  async exists(userId: User['id'], token: string) {
    return await this.prisma.token.findUnique({ where: { userId, token } });
  }

  async getUserId(token: string) {
    const t = await this.prisma.token.findUnique({ where: { token } });
    if (!t) throw new NotFoundException('Token not found');
    if (!this.tokenActive(t.expireAt)) throw new ForbiddenException();
    return t.userId;
  }

  tokenActive(expireAt: string): boolean {
    return new Date(expireAt) > new Date(Date.now());
  }

  async tokenActiveByToken(token: string) {
    const t = await this.prisma.token.findUnique({ where: { token } });
    if (!t) throw new ForbiddenException();
    return this.tokenActive(t.expireAt);
  }
}
