import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import {
  TGuestbookData,
  TGuestbookResponse,
  TGuestbookSelect,
} from 'src/common/types/guestbooks.type';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { S3Service } from '../../storage/aws.service';
import { CreateGuestbookDto, UpdateGuestbookDto } from './guestbooks.dto';
import {
  GuestBookAccessDeniedException,
  GuestBookNotFoundException,
} from './guestbooks.exception';

@Injectable()
export class GuestbooksService {
  GUESTBOOK_SELECT_FIELDS: TGuestbookSelect;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {
    this.GUESTBOOK_SELECT_FIELDS = {
      id: true,
      userId: true,
      visitorName: true,
      content: true,
      imageUrl: true,
      createdAt: true,
      user: {
        select: {
          userProfile: {
            select: {
              nickname: true,
            },
          },
        },
      },
    };
  }

  async findAll(userId: string, page?: number, limit?: number) {
    const take: number = !limit || limit < 0 ? 10 : limit;
    const skip: number = !page || page <= 0 ? 0 : (page - 1) * take;

    const result = await this.prismaService.guestBook.findMany({
      select: this.GUESTBOOK_SELECT_FIELDS,
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });

    return this.extractGuestBooksData(result);
  }

  async create(
    userId: string,
    imageFile: Express.Multer.File,
    dto: CreateGuestbookDto,
  ) {
    const imageUrl = await this.uploadImage(imageFile);

    const createData = {
      data: {
        id: nanoid(),
        userId,
        imageUrl,
        ...dto,
      },
      select: this.GUESTBOOK_SELECT_FIELDS,
    };

    const result = await this.prismaService.guestBook.create(createData);

    return this.extractGuestBookData(result);
  }

  async update(id: string, dto: UpdateGuestbookDto, userId?: string) {
    const foundGuestbook = await this.prismaService.guestBook.findUnique({
      where: { id },
      select: this.GUESTBOOK_SELECT_FIELDS,
    });

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
    const result = await this.prismaService.guestBook.findUnique({
      where: { id },
      select: this.GUESTBOOK_SELECT_FIELDS,
    });

    if (!result) throw new GuestBookNotFoundException();

    return this.extractGuestBookData(result as TGuestbookData);
  }

  async delete(id: string, userId: string) {
    const guestbook = await this.prismaService.guestBook.findUnique({
      where: { id },
      select: this.GUESTBOOK_SELECT_FIELDS,
    });

    this.validateGuestbook(guestbook, userId);

    const result = await this.prismaService.guestBook.delete({
      where: { id },
      select: this.GUESTBOOK_SELECT_FIELDS,
    });

    return this.extractGuestBookData(result);
  }

  private validateGuestbook(guestbook: TGuestbookData | null, userId: string) {
    if (!guestbook) {
      throw new GuestBookNotFoundException();
    } else if (guestbook.userId !== userId)
      throw new GuestBookAccessDeniedException();
  }

  private async uploadImage(imageFile: Express.Multer.File) {
    return this.s3Service.uploadFile(imageFile);
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
