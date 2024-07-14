import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import {
  TGuestbookData,
  TGuestbookResponse,
} from 'src/common/types/guestbooks.type';
import { S3Service } from '../../storage/aws.service';
import { CreateGuestbookDto, UpdateGuestbookDto } from './guestbooks.dto';
import {
  GuestBookAccessDeniedException,
  GuestBookNoImageException,
  GuestBookNotFoundException,
} from './guestbooks.exception';
import { GuestbooksRepository } from './guestbooks.repository';

@Injectable()
export class GuestbooksService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly guestbooksRepository: GuestbooksRepository,
  ) {}

  async findGuestbooks(userId: string, page?: number, limit?: number) {
    const take: number = !limit || limit < 0 ? 10 : limit;
    const skip: number = !page || page <= 0 ? 0 : (page - 1) * take;

    const result = await this.guestbooksRepository.findMany(userId, skip, take);

    return this.extractGuestBooksData(result);
  }

  async getCount(userId: string) {
    return await this.guestbooksRepository.count(userId);
  }

  async create(
    userId: string,
    imageFile: Express.Multer.File,
    dto: CreateGuestbookDto,
  ) {
    const imageKey = await this.s3Service.uploadFile(imageFile);

    const result = await this.guestbooksRepository.create({
      id: nanoid(),
      userId,
      imageKey,
      ...dto,
    });

    return this.extractGuestBookData(result);
  }

  async updateMessage(id: string, dto: UpdateGuestbookDto, userId?: string) {
    const foundGuestbook = await this.guestbooksRepository.findUniqueBy({ id });

    if (!foundGuestbook) throw new GuestBookNotFoundException();
    else if (foundGuestbook.content && foundGuestbook.userId !== userId)
      throw new GuestBookAccessDeniedException();

    const result = await this.prismaService.guestBook.update({
      select: this.GUESTBOOK_SELECT_FIELDS,
      where: { id },
      data: dto,
    });

    return this.extractGuestBookData(result);
  }

  async findOne(id: string) {
    const result = await this.guestbooksRepository.findUniqueBy({ id });

    if (!result) throw new GuestBookNotFoundException();

    return this.extractGuestBookData(result as TGuestbookData);
  }

  async delete(id: string, userId: string) {
    const guestbook = await this.guestbooksRepository.findUniqueBy({ id });

    this.validateGuestbook(guestbook, userId);

    const result = await this.guestbooksRepository.deleteOneBy({ id });

    return this.extractGuestBookData(result);
  }

  private validateGuestbook(guestbook: TGuestbookData | null, userId: string) {
    if (!guestbook) {
      throw new GuestBookNotFoundException();
    } else if (guestbook.userId !== userId)
      throw new GuestBookAccessDeniedException();
  }

  private extractGuestBookData(guestBook: TGuestbookData): TGuestbookResponse {
    const { user, ...foundGuestbook } = guestBook;

    return {
      ...foundGuestbook,
      hostNickname: user.userProfile?.nickname,
    };
  }

  private extractGuestBooksData(
    guestBooks: TGuestbookData[],
  ): TGuestbookResponse[] {
    return guestBooks.map((guestBook) => this.extractGuestBookData(guestBook));
  }
}
