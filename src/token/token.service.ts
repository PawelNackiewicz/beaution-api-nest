import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import type { User } from '@prisma/client';
import * as moment from 'moment';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ✅
  async signUser(user: User, withStatusCheck: boolean = true) {
    if (withStatusCheck && user.status !== 'ACTIVE') {
      throw new UnauthorizedException();
    }
    const token = await this.jwtService.signAsync({
      sub: user.id,
      login: user.login,
    });
    const expireAt = moment().add(1, 'day').toISOString();

    await this.prisma.token.create({
      data: { token, expireAt, userId: user.id },
    });

    return token;
  }

  async getActivationToken(userId: string, userEmail: string): Promise<string> {
    return await this.jwtService.signAsync(
      { sub: userId, email: userEmail },
      { expiresIn: '4h' },
    );
  }

  async verifyActivationToken(
    token: string,
  ): Promise<{ userId: number; email: string }> {
    try {
      const decoded = this.jwtService.verify(token);
      return { userId: parseInt(decoded.sub), email: decoded.email };
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // ✅
  async delete(userId: User['id'], token: string) {
    try {
      return await this.prisma.token.delete({ where: { userId, token } });
    } catch (e) {
      throw new NotFoundException('Token not found');
    }
  }

  // ✅
  async deleteAll(userId: User['id']) {
    try {
      return await this.prisma.token.deleteMany({ where: { userId } });
    } catch (e) {
      throw new NotFoundException('Token not found');
    }
  }

  // ✅
  async exists(userId: User['id'], token: string) {
    return await this.prisma.token.findUnique({ where: { userId, token } });
  }

  // ✅
  async getUserId(token: string) {
    const t = await this.prisma.token.findUnique({ where: { token } });
    if (!t) throw new NotFoundException('Token not found');
    if (!this.tokenActive(t.expireAt)) throw new ForbiddenException();
    return t.userId;
  }

  // ✅
  tokenActive(expireAt: string): boolean {
    return new Date(expireAt) > new Date(Date.now());
  }

  // ✅
  async tokenActiveByToken(token: string) {
    const t = await this.prisma.token.findUnique({ where: { token } });
    if (!t) throw new ForbiddenException();
    return this.tokenActive(t.expireAt);
  }
}
