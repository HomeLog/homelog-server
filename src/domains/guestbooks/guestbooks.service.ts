import { Inject, Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import {
  TGuestbookData,
  TGuestbookPayload,
} from 'src/common/types/guestbooks.type';
import { StorageService } from 'src/storage/storage.service';
import { GuestbooksRepository } from './components/guestbooks.repository';
import { CreateGuestbookDto, UpdateGuestbookDto } from './guestbooks.dto';
import {
  GuestBookAccessDeniedException,
  GuestBookNoImageException,
  GuestBookNotFoundException,
} from './guestbooks.exception';

@Injectable()
export class GuestbooksService {
  constructor(
    @Inject('StorageService')
    private readonly storageService: StorageService,

    private readonly guestbooksRepository: GuestbooksRepository,
  ) {}

  async findGuestbooks(userId: string, skip?: number, take?: number) {
    const result = await this.guestbooksRepository.findMany(userId, skip, take);

    return this.extractGuestBooksData(result);
  }

  async getCount(userId: string) {
    return await this.guestbooksRepository.count(userId);
  }

  async create(userId: string, dto: CreateGuestbookDto) {
    const id = nanoid();

    const result = await this.guestbooksRepository.create({
      id,
      userId,
      ...dto,
    });

    return this.extractGuestBookData(result);
  }

  async updateMessage(id: string, dto: UpdateGuestbookDto, userId?: string) {
    const foundGuestbook = await this.guestbooksRepository.findUniqueBy({ id });

    if (!foundGuestbook) throw new GuestBookNotFoundException();
    else if (foundGuestbook.content && foundGuestbook.userId !== userId)
      throw new GuestBookAccessDeniedException();

    const result = await this.guestbooksRepository.updateOneBy(
      { id },
      {
        content: dto.content,
      },
    );

    return this.extractGuestBookData(result);
  }

  async updatePhoto(
    id: string,
    userId: string,
    imageFile: Express.Multer.File,
  ) {
    const foundGuestbook = await this.guestbooksRepository.findUniqueBy({ id });

    if (!foundGuestbook) throw new GuestBookNotFoundException();
    else if (foundGuestbook.userId !== userId)
      throw new GuestBookAccessDeniedException();
    else if (!foundGuestbook.imageKey) {
      throw new GuestBookNoImageException();
    }

    const [newImageKey] = await Promise.all([
      this.storageService.uploadFile(imageFile),
      this.storageService.deleteFile(foundGuestbook.imageKey),
    ]);

    const result = await this.guestbooksRepository.updateOneBy(
      { id },
      {
        imageKey: newImageKey,
      },
    );

    return this.extractGuestBookData(result);
  }

  async findOne(id: string) {
    const result = await this.guestbooksRepository.findUniqueBy({ id });

    if (!result) throw new GuestBookNotFoundException();

    return this.extractGuestBookData(result as TGuestbookPayload);
  }

  async delete(id: string, userId: string) {
    const guestbook = await this.guestbooksRepository.findUniqueBy({ id });

    this.validateGuestbook(guestbook, userId);

    const result = await this.guestbooksRepository.deleteOneBy({ id });

    return this.extractGuestBookData(result);
  }

  private validateGuestbook(
    guestbook: TGuestbookPayload | null,
    userId: string,
  ) {
    if (!guestbook) {
      throw new GuestBookNotFoundException();
    } else if (guestbook.userId !== userId)
      throw new GuestBookAccessDeniedException();
  }

  private extractGuestBookData(guestBook: TGuestbookPayload): TGuestbookData {
    const { user, ...foundGuestbook } = guestBook;

    return {
      ...foundGuestbook,
      hostNickname: user.userProfile?.nickname,
    };
  }

  private extractGuestBooksData(
    guestBooks: TGuestbookPayload[],
  ): TGuestbookData[] {
    return guestBooks.map((guestBook) => this.extractGuestBookData(guestBook));
  }
}
