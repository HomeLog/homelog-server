import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TGuestbookSelectFields } from 'src/common/types/guestbooks.type';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class GuestbooksRepository {
  private readonly GUESTBOOK_SELECT_FIELDS: TGuestbookSelectFields;

  constructor(private readonly prismaService: PrismaService) {
    this.GUESTBOOK_SELECT_FIELDS = {
      id: true,
      userId: true,
      visitorName: true,
      content: true,
      imageKey: true,
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

  async findMany(userId: string, skip: number, take: number) {
    const guestbooks = await this.prismaService.guestBook.findMany({
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

    return guestbooks;
  }

  async count(userId: string) {
    return await this.prismaService.guestBook.count({
      where: { userId },
    });
  }

  async create(data: Prisma.GuestBookUncheckedCreateInput) {
    const createData = {
      data,
      select: this.GUESTBOOK_SELECT_FIELDS,
    };

    const createdGuestbook =
      await this.prismaService.guestBook.create(createData);

    return createdGuestbook;
  }

  async findUniqueBy(where: Prisma.GuestBookWhereUniqueInput) {
    const guestbook = await this.prismaService.guestBook.findUnique({
      where,
      select: this.GUESTBOOK_SELECT_FIELDS,
    });

    return guestbook;
  }

  async updateOneBy(
    where: Prisma.GuestBookWhereUniqueInput,
    data: Partial<Prisma.GuestBookUpdateInput>,
  ) {
    const updatedGuestbook = await this.prismaService.guestBook.update({
      select: this.GUESTBOOK_SELECT_FIELDS,
      where,
      data,
    });

    return updatedGuestbook;
  }

  async deleteOneBy(where: Prisma.GuestBookWhereUniqueInput) {
    return await this.prismaService.guestBook.delete({
      where,
      select: this.GUESTBOOK_SELECT_FIELDS,
    });
  }
}
