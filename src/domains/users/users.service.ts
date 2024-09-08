import { Injectable } from '@nestjs/common';
import { UserProfile } from '@prisma/client';
import { TUserProfileImages } from 'src/common/types/users.type';
import { KakaoAuthComponent } from './components/kakao-auth.component';
import { UsersRepositoryComponent } from './components/users-repository.component';
import { UsersStorageComponent } from './components/users-storage.component';
import { EditProfileDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly kakaoAuthComponent: KakaoAuthComponent,
    private readonly usersStorageComponent: UsersStorageComponent,
    private readonly usersRepositoryComponent: UsersRepositoryComponent,
  ) {}

  getKakaoCode() {
    return this.kakaoAuthComponent.getKakaoCode();
  }

  async createUserByKakao(oAuthCode: string) {
    const oAuthAccessToken = await this.kakaoAuthComponent.signIn(oAuthCode);

    const { kakaoId, nickname } =
      await this.kakaoAuthComponent.getUserInfo(oAuthAccessToken);

    const user = await this.usersRepositoryComponent.createUser(
      kakaoId,
      nickname,
    );

    return user;
  }

  async getUser(id: string) {
    return await this.usersRepositoryComponent.getOneUser(id);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    return await this.usersRepositoryComponent.getOneProfile(userId);
  }

  async editProfile(
    userId: string,
    dto: EditProfileDto,
    profileImages: TUserProfileImages,
  ) {
    const { avatarImageKey, homeImageKey } =
      await this.usersRepositoryComponent.getOneProfile(userId);

    const { newAvatarImageKey, newHomeImageKey } =
      await this.usersStorageComponent.updateProfileImages(
        {
          avatarImageKey,
          homeImageKey,
        },
        profileImages,
      );

    return await this.usersRepositoryComponent.editProfile(userId, {
      ...dto,
      avatarImageKey: newAvatarImageKey,
      homeImageKey: newHomeImageKey,
    });
  }

  async deleteImage(
    userId: string,
    imageKey: 'avatarImageKey' | 'homeImageKey',
  ) {
    const { [imageKey]: imageKeyToDelete } =
      await this.usersRepositoryComponent.getOneProfile(userId);

    await this.usersStorageComponent.deleteUserProfileImage(imageKeyToDelete);
    await this.usersRepositoryComponent.editProfile(userId, {
      [imageKey]: null,
    });
  }
}
