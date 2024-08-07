import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserProfile } from '@prisma/client';
import axios from 'axios';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { EditProfileDto, SignUpKakaoDto } from './users.dto';

@Injectable()
export class UsersService {
  private readonly restApiKey: string;
  private readonly redirectUri: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.restApiKey = this.configService.getOrThrow('REST_API_KEY');
    this.redirectUri = this.configService.getOrThrow('REDIRECT_URI');
  }

  getKakaoCode() {
    return `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${this.restApiKey}&redirect_uri=${this.redirectUri}`;
  }

  async kakaoSignIn(code: string) {
    const url = 'https://kauth.kakao.com/oauth/token';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.restApiKey,
      redirect_uri: this.redirectUri,
      code,
    });
    const header = {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };

    const response = await axios.post(url, params, {
      headers: header,
    });

    return response.data.access_token;
  }

  async kakaoSignOut(token: string) {
    const url = 'https://kapi.kakao.com/v1/user/logout';
    const header = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${token}`,
    };
    await axios.post(url, null, { headers: header });
    return true;
  }

  async createUser(dto: SignUpKakaoDto, userInfo) {
    const kakaoId = dto.id.toString();
    const nickname = userInfo.data.properties.nickname;
    const guestBookName = `${nickname}님의 방명록`;

    const user = await this.prismaService.user.upsert({
      where: { id: kakaoId },
      update: {},
      create: {
        id: kakaoId,
        userProfile: {
          create: {
            nickname: nickname,
            guestBookName: guestBookName,
          },
        },
      },
      include: {
        userProfile: true,
      },
    });

    return user;
  }

  // async getKakaoProfile(accessToken: string) {
  //   const url = 'https://kapi.kakao.com/v2/user/me';
  //   const headers = {
  //     Authorization: `Bearer ${accessToken}`,
  //     'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
  //   };

  //   const response = await axios.get(url, { headers });

  //   const nickname = response.data.properties.nickname;
  //   const guestBookName = `${nickname}님의 방명록`;

  //   const dto = {
  //     nickname: nickname,
  //     guestBookName: guestBookName,
  //     deleted: false,
  //   };

  //   return dto;
  // }

  async findUserById(id: string) {
    return await this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async getProfileById(userId: string): Promise<UserProfile | null> {
    const profile = await this.prismaService.userProfile.findUnique({
      where: { id: userId },
    });

    return profile;
  }

  async editProfile(
    userId: string,
    dto: EditProfileDto,
    avatarImage?: string | null,
    homeImage?: string | null,
  ) {
    return await this.prismaService.userProfile.update({
      where: { id: userId },
      data: { ...dto, avatarImageKey: avatarImage, homeImageKey: homeImage },
    });
  }

  async deleteImage(userId: string, isAvatarImage: boolean) {
    const imageKeyToUpdate = isAvatarImage ? 'avatarImageKey' : 'homeImageKey';
    await this.prismaService.userProfile.update({
      where: { id: userId },
      data: {
        [imageKeyToUpdate]: null,
      },
    });
  }
}
