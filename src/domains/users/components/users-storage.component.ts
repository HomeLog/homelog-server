import { Inject, Injectable } from '@nestjs/common';
import { TUserProfileImages } from 'src/common/types/users.type';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class UsersStorageComponent {
  constructor(
    @Inject('StorageService')
    private readonly storageService: StorageService,
  ) {}

  async putUserProfileImages(
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

  async deleteUserProfileImage(key?: string | null) {
    if (!key) return;
    await this.storageService.deleteFile(key);
  }

  async deleteUserProfileImages(...keys: (string | null | undefined)[]) {
    const deletionPromises = keys
      .filter((k): k is string => k !== null && k !== undefined)
      .map((key) => this.storageService.deleteFile(key));

    await Promise.all(deletionPromises);
  }
}
