import { Inject, Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { StorageService } from 'src/storage/storage.service';
import { GuestbooksConverterComponent } from './components/guestbooks-converter.component';
import { GuestbooksRepositoryComponent } from './components/guestbooks-repository.component';
import { GuestbooksValidatorComponent } from './components/guestbooks-validator.component';
import { CreateGuestbookDto, UpdateGuestbookDto } from './guestbooks.dto';

@Injectable()
export class GuestbooksService {
  constructor(
    @Inject('StorageService')
    private readonly storageService: StorageService,
    private readonly guestbooksConverterComponent: GuestbooksConverterComponent,
    private readonly guestbooksValidatorComponent: GuestbooksValidatorComponent,
    private readonly guestbooksRepositoryComponent: GuestbooksRepositoryComponent,
  ) {}

  async findGuestbooks(userId: string, skip?: number, take?: number) {
    const result = await this.guestbooksRepositoryComponent.findManyByUserId(
      userId,
      skip,
      take,
    );

    return this.guestbooksConverterComponent.convertToGuestbookDataList(result);
  }

  async getCount(userId: string) {
    return await this.guestbooksRepositoryComponent.countByUserId(userId);
  }

  async create(userId: string, dto: CreateGuestbookDto) {
    const id = nanoid();

    const result = await this.guestbooksRepositoryComponent.create(
      id,
      userId,
      dto,
    );

    return this.guestbooksConverterComponent.payloadToGuestbookData(result);
  }

  async updateMessage(id: string, dto: UpdateGuestbookDto) {
    const foundGuestbook = await this.guestbooksRepositoryComponent.getOne(id);

    this.guestbooksValidatorComponent.passEmptyContent(foundGuestbook);

    const result = await this.guestbooksRepositoryComponent.updateOne(id, {
      content: dto.content,
    });

    return this.guestbooksConverterComponent.payloadToGuestbookData(result);
  }

  async updatePhoto(
    id: string,
    userId: string,
    imageFile: Express.Multer.File,
  ) {
    const foundGuestbook = await this.guestbooksRepositoryComponent.getOne(id);

    this.guestbooksValidatorComponent.passPhotoUpdate(foundGuestbook, userId);

    const [newImageKey] = await Promise.all([
      this.storageService.uploadFile(imageFile),
      this.storageService.deleteFile(foundGuestbook.imageKey!),
    ]);

    const result = await this.guestbooksRepositoryComponent.updateOne(id, {
      imageKey: newImageKey,
    });

    return this.guestbooksConverterComponent.payloadToGuestbookData(result);
  }

  async getOne(id: string) {
    const result = await this.guestbooksRepositoryComponent.getOne(id);
    return this.guestbooksConverterComponent.payloadToGuestbookData(result);
  }

  async delete(id: string, userId: string) {
    const guestbook = await this.guestbooksRepositoryComponent.getOne(id);

    this.guestbooksValidatorComponent.passDelete(guestbook, userId);

    const result = await this.guestbooksRepositoryComponent.deleteOne(id);

    return this.guestbooksConverterComponent.payloadToGuestbookData(result);
  }
}
