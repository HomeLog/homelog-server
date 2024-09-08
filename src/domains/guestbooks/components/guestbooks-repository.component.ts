import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  TGuestbookPayload,
  TGuestbookSelectFields,
} from 'src/common/types/guestbooks.type';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { GuestBookNotFoundException } from '../guestbooks.exception';

@Injectable()
export class GuestbooksRepositoryComponent {
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

  async findManyByUserId(userId: string, skip: number = 0, take: number = 10) {
    take = !take || take < 0 ? 10 : take;
    skip = !skip || skip <= 0 ? 0 : (skip - 1) * take;

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

  async countByUserId(userId: string) {
    return await this.prismaService.guestBook.count({
      where: { userId },
    });
  }

  async create(
    id: string,
    userId: string,
    data: Partial<Prisma.GuestBookCreateWithoutUserInput>,
  ) {
    const createData = {
      data: {
        id,
        userId,
        ...data,
      },
      select: this.GUESTBOOK_SELECT_FIELDS,
    };

    const createdGuestbook =
      await this.prismaService.guestBook.create(createData);

    return createdGuestbook;
  }

  private async findUnique(where: Prisma.GuestBookWhereUniqueInput) {
    return await this.prismaService.guestBook.findUnique({
      where,
      select: this.GUESTBOOK_SELECT_FIELDS,
    });
  }

  /**
   * 특정 게스트북을 '찾는' 메서드
   *
   *  @param guestbookId - 찾을 게스트북의 id
   * @returns Promise<TGuestbookPayload | null>
   */
  async findOne(guestbookId: string): Promise<TGuestbookPayload | null> {
    const guestbook = await this.findUnique({ id: guestbookId });
    return guestbook;
  }

  /**
   * 특정 게스트북을 '가져오는' 메서드
   *
   * @param guestbookId - 가져올 게스트북의 아이디
   * @returns Promise<TGuestbookPayload>
   * @throws GuestBookNotFoundException
   */
  async getOne(guestbookId: string): Promise<TGuestbookPayload> {
    const guestbook = await this.findUnique({ id: guestbookId });
    if (!guestbook) throw new GuestBookNotFoundException();
    return guestbook;
  }

  async updateOne(
    guestBookId: string,
    data: Partial<Prisma.GuestBookUpdateInput>,
  ) {
    return await this.prismaService.guestBook.update({
      select: this.GUESTBOOK_SELECT_FIELDS,
      where: { id: guestBookId },
      data,
    });
  }

  async deleteOne(guestBookId: string) {
    return await this.prismaService.guestBook.delete({
      where: { id: guestBookId },
      select: this.GUESTBOOK_SELECT_FIELDS,
    });
  }
}
