import { Injectable, NotFoundException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import utils from 'src/common/utils';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { TGuestbookSelect } from 'src/types/guestbooks.type';
import { S3Service } from '../../storage/aws.service';
import { CreateGuestbookDto, UpdateGuestbookDto } from './guestbooks.dto';

@Injectable()
export class GuestbooksService {
  GUESTBOOK_SELECT_FIELDS: TGuestbookSelect;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {
    this.GUESTBOOK_SELECT_FIELDS = {
      id: true,
      visitorName: true,
      content: true,
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

  async findAll(userId: string) {
    const result = await this.prismaService.guestBook.findMany({
      select: this.GUESTBOOK_SELECT_FIELDS,
      where: {
        userId,
      },
    });

    return utils.guestbook.extractGuestBooksData(result);
  }

  async findOne(id: string, userId: string) {
    const result = await this.prismaService.guestBook.findUnique({
      select: this.GUESTBOOK_SELECT_FIELDS,
      where: { id, userId },
    });

    if (!result) throw new NotFoundException('Guestbook not found');

    return utils.guestbook.extractGuestBookData(result);
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

    return utils.guestbook.extractGuestBookData(result);
  }

  async update(id: string, dto: UpdateGuestbookDto) {
    const result = await this.prismaService.guestBook.update({
      select: this.GUESTBOOK_SELECT_FIELDS,
      where: { id },
      data: dto,
    });

    return utils.guestbook.extractGuestBookData(result);
  }

  async delete(id: string) {
    return this.prismaService.guestBook.delete({ where: { id } });
  }

  private async uploadImage(
    imageFile: Express.Multer.File,
  ): Promise<string | undefined> {
    return this.s3Service.uploadFile(imageFile);
  }
}
