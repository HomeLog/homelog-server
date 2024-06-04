import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { S3Service } from '../../storage/aws.service';
import { CreateGuestbookDto, UpdateGuestbookDto } from './guestbooks.dto';

@Injectable()
export class GuestbooksService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  // @TODO: 방명록 목록 조회
  async findAll() {
    return this.prismaService.guestBook.findMany();
  }

  // @TODO: 방명록 단건 조회
  async findOne(id: string) {
    return this.prismaService.guestBook.findUnique({ where: { id } });
  }

  // @TODO: 방명록 생성
  async create(
    userId: string,
    imageFile: Express.Multer.File,
    dto: CreateGuestbookDto,
  ) {
    const id = nanoid();

    const imageUrl = await this.s3Service.uploadFile(imageFile);

    return this.prismaService.guestBook.create({
      data: { id, userId, imageUrl, ...dto },
    });
  }

  // @TODO: 방명록 수정 / 작성
  async update(id: string, dto: UpdateGuestbookDto) {
    return this.prismaService.guestBook.update({
      where: { id },
      data: dto,
    });
  }

  // @TODO: 방명록 삭제
  async delete(id: string) {
    return this.prismaService.guestBook.delete({ where: { id } });
  }
}
