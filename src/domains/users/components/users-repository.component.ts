import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import {
  UserNotFoundException,
  UserProfileNotFoundException,
} from '../users.exception';

@Injectable()
export class UsersRepositoryComponent {
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

  private async findOneUserBase(userId: string) {
    return await this.prismaService.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * 사용자를 찾는 메서드
   *
   * @param userId 사용자의 아이디
   * @returns 사용자 정보
   */
  async findOneUser(userId: string) {
    return await this.findOneUserBase(userId);
  }

  /**
   * 특정 사용자의 정보를 가져옴
   *
   * @param userId 사용자 식별자
   * @returns 사용자 정보
   * @throws {UserNotFoundException} 사용자를 찾을 수 없을 때 발생하는 예외
   */
  async getOneUser(userId: string) {
    const user = await this.findOneUserBase(userId);

    if (!user) throw new UserNotFoundException();

    return user;
  }

  private async fineOneProfileBase(userId: string) {
    return await this.prismaService.userProfile.findUnique({
      where: { id: userId },
    });
  }

  async fineOneProfile(userId: string) {
    return await this.fineOneProfileBase(userId);
  }

  /**
   * 사용자의 ID로 사용자 프로필을 가져옴
   *
   * @param userId - 사용자의 ID
   * @returns 사용자의 프로필
   * @throws UserProfileNotFoundException - 사용자 프로필을 찾을 수 없는 경우 발생
   */
  async getOneProfile(userId: string) {
    const profile = await this.fineOneProfileBase(userId);

    if (!profile) throw new UserProfileNotFoundException();

    return profile;
  }

  async editProfile(userId: string, data: Prisma.UserProfileUpdateInput) {
    return await this.prismaService.userProfile.update({
      where: { id: userId },
      data,
    });
  }
}
