import { Inject, Injectable } from '@nestjs/common';
import { TUserProfileImages } from 'src/common/types/users.type';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class UsersStorageComponent {
  constructor(
    @Inject('StorageService')
    private readonly storageService: StorageService,
  ) {}

  private async uploadProfileImages(
    images: TUserProfileImages,
  ): Promise<{ avatarImageKey?: string; homeImageKey?: string }> {
    const { avatarImage, homeImage } = {
      avatarImage: images?.avatarImage?.pop(),
      homeImage: images?.homeImage?.pop(),
    };

    const [avatarImageKey, homeImageKey] = await Promise.all([
      this.storageService.uploadFile(avatarImage),
      this.storageService.uploadFile(homeImage),
    ]);

    return { avatarImageKey, homeImageKey };
  }

  private async deleteProfileImages(...keys: (string | null | undefined)[]) {
    const validKeys = keys.filter((k): k is string => k != null);

    await Promise.all(
      validKeys.map((key) => this.storageService.deleteFile(key)),
    );
  }

  async updateProfileImages(
    imageKeys: {
      avatarImageKey?: string | null;
      homeImageKey?: string | null;
    },
    newProfileImages: TUserProfileImages,
  ): Promise<{ newAvatarImageKey?: string; newHomeImageKey?: string }> {
    this.deleteProfileImages(imageKeys.avatarImageKey, imageKeys.homeImageKey);

    const { avatarImageKey: newAvatarImageKey, homeImageKey: newHomeImageKey } =
      await this.uploadProfileImages(newProfileImages);

    return { newAvatarImageKey, newHomeImageKey };
  }

  async deleteUserProfileImage(key?: string | null) {
    await this.storageService.deleteFile(key ?? '');
  }
}
