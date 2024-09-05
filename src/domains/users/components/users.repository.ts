import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(userId: string, nickname?: string) {
    return await this.prismaService.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        userProfile: {
          create: {
            nickname: nickname ?? '',
            guestBookName: `${nickname}님의 방명록`,
          },
        },
      },
      include: {
        userProfile: true,
      },
    });
  }

  async findUser(userId: string) {
    return await this.prismaService.user.findUnique({
      where: { id: userId },
    });
  }

  async findUsersProfile(userId: string) {
    return await this.prismaService.userProfile.findUnique({
      where: { id: userId },
    });
  }

  async editProfile(userId: string, data: Prisma.UserProfileUpdateInput) {
    return await this.prismaService.userProfile.update({
      where: { id: userId },
      data,
    });
  }
}
