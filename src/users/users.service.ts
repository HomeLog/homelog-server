import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreateProfileDto, EditProfileDto, SignUpKakaoDto } from './users.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { User, UserProfile } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly restApiKey: string;
  private readonly redirectUri: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.restApiKey = this.getConfigValue('REST_API_KEY');
    this.redirectUri = this.getConfigValue('REDIRECT_URI');
  }

  private getConfigValue(key: string): string {
    const value = this.configService.get(key);

    if (!value) throw new Error(`${key} is missing`);

    return value;
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

  async createUser(dto: SignUpKakaoDto) {
    return await this.prismaService.user.create({ data: dto });
  }

  async validateToken(token: string): Promise<User | null> {
    const url = 'https://kapi.kakao.com/v2/user/me';
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const kakaoId = response.data.id.toString();
    return await this.prismaService.user.findUnique({
      where: { id: kakaoId },
    });
  }

  async createProfile(
    userId: string,
    dto: CreateProfileDto,
    profileImage?: string | null,
    homeImage?: string | null,
  ): Promise<UserProfile | null> {
    const profile = await this.prismaService.userProfile.create({
      data: {
        id: userId,
        ...dto,
        profileImageUrl: profileImage,
        homeImageUrl: homeImage,
      },
    });

    return profile;
  }

  async getProfileById(userId: string): Promise<UserProfile | null> {
    const profile = await this.prismaService.userProfile.findUnique({
      where: { id: userId },
    });

    if (profile) return profile;
    else return null;
  }

  async editProfile(
    userId: string,
    dto: EditProfileDto,
    profileImage?: string | null,
    homeImage?: string | null,
  ) {
    await this.prismaService.userProfile.update({
      where: { id: userId },
      data: { ...dto, profileImageUrl: profileImage, homeImageUrl: homeImage },
    });
  }
}
