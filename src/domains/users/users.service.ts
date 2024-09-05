import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserProfile } from '@prisma/client';
import { DToken } from 'src/common/types/token.type';
import { KakaoAuthComponent } from './components/kakao-auth.component';
import { TokenManagerComponent } from './components/token-manager.component';
import { UsersRepository } from './components/users.repository';
import { EditProfileDto } from './users.dto';

@Injectable()
export class UsersService {
  private readonly restApiKey: string;
  private readonly redirectUri: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly kakaoAuthComponent: KakaoAuthComponent,
    private readonly tokenManagerComponent: TokenManagerComponent,
  ) {
    this.restApiKey = this.configService.getOrThrow('REST_API_KEY');
    this.redirectUri = this.configService.getOrThrow('REDIRECT_URI');
  }

  getKakaoCode() {
    return this.kakaoAuthComponent.getKakaoCode();
  }

  async kakaoSignIn(code: string) {
    const tokenValue = this.kakaoAuthComponent.signIn(code);
    return tokenValue;
  }

  async kakaoSignOut(token: string) {
    const siginOutResult = await this.kakaoAuthComponent.signOut(token);
    return siginOutResult;
  }

  async createUserByKakao(oAuthCode: string) {
    const oAuthAccessToken = await this.kakaoAuthComponent.signIn(oAuthCode);
    const userInfo = await this.kakaoAuthComponent.userInfo(oAuthAccessToken);

    const { kakaoId, nickname } = {
      kakaoId: userInfo.id.toString(),
      nickname: userInfo.properties.nickname,
    };

    const user = await this.usersRepository.createUser(kakaoId, nickname);
    return user;
  }

  async findUserById(id: string) {
    const user = await this.usersRepository.findUser(id);
    return user;
  }

  async getProfileById(userId: string): Promise<UserProfile | null> {
    const profile = await this.usersRepository.findUsersProfile(userId);
    return profile;
  }

  async editProfile(
    userId: string,
    dto: EditProfileDto,
    avatarImageKey?: string | null,
    homeImageKey?: string | null,
  ) {
    return await this.usersRepository.editProfile(userId, {
      ...dto,
      avatarImageKey,
      homeImageKey,
    });
  }

  async deleteImage(userId: string, isAvatarImage: boolean) {
    const imageKeyToUpdate = isAvatarImage ? 'avatarImageKey' : 'homeImageKey';
    await this.usersRepository.editProfile(userId, {
      [imageKeyToUpdate]: null,
    });
  }

  generateTokens(userId: string): {
    accessToken: DToken;
    refreshToken: DToken;
  } {
    const tokens = this.tokenManagerComponent.generateTokens(userId);

    return tokens;
  }

  async regenerateTokens(refreshToken: string) {
    try {
      const { subject: userId } =
        this.tokenManagerComponent.verifyTokenValue(refreshToken);

      const user = await this.usersRepository.findUser(userId);

      if (!user) throw new UnauthorizedException('invalid refresh token');

      const tokens = this.tokenManagerComponent.generateTokens(userId);

      return tokens;
    } catch (error) {
      throw error;
    }
  }
}
