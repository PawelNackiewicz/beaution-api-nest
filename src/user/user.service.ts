import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async getUser(userWhereUniqueInput: Prisma.UserWhereUniqueInput) {
    try {
      const user = await this.prisma.user.findUnique({
        where: userWhereUniqueInput,
      });
      return this.sanitizeUser(user);
    } catch (e) {
      throw new Error('User not found');
    }
  }

  async getUsers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    try {
      const { skip, take, cursor, where, orderBy } = params;
      const users = await this.prisma.user.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });
      return users.map((user) => this.sanitizeUser(user));
    } catch (e) {
      throw new Error('Users not found');
    }
  }

  async findUserById(id: User['id']) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });
      return this.sanitizeUser(user);
    } catch (e) {
      throw new Error('User not found');
    }
  }
  async findUserByLogin(login: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          login,
        },
      });
      return this.sanitizeUser(user);
    } catch (e) {
      throw new Error('User not found');
    }
  }

  async createUser(data: Prisma.UserCreateInput) {
    const hash = await this.hashPassword(data.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          ...data,
          status: 'PENDING',
          password: hash,
        },
      });
      return this.sanitizeUser(user);
    } catch (e) {
      throw new Error('User not created');
    }
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }) {
    try {
      const { where, data } = params;
      const user = await this.prisma.user.update({
        data,
        where,
      });
      return this.sanitizeUser(user);
    } catch (e) {
      throw new Error('User not updated');
    }
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput) {
    try {
      return this.prisma.user.delete({
        where,
      });
    } catch (e) {
      throw new Error('User not deleted');
    }
  }

  sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
