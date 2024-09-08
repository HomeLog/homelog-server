import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { DAccount, Private } from 'src/common/decorators';
import { TGuestbookData } from 'src/common/types/guestbooks.type';
import { StorageService } from 'src/storage/storage.service';
import {
  CreateGuestbookDto,
  PaginationQueryDto,
  UpdateGuestbookDto,
} from './guestbooks.dto';
import { GuestbooksService } from './guestbooks.service';

@Controller('guestbooks')
@ApiTags('방명록 API')
export class GuestbooksController {
  constructor(
    private readonly guestbooksService: GuestbooksService,
    @Inject('StorageService')
    private readonly storageService: StorageService,
  ) {}

  /**
   * 방명록 목록을 조회합니다.
   */
  @Get()
  @Private('user')
  @ApiCookieAuth()
  async findAll(
    @Query()
    paginationQuery: PaginationQueryDto,
    @DAccount('user')
    user: User,
  ) {
    const guestbooks: TGuestbookData[] =
      await this.guestbooksService.findGuestbooks(
        user.id,
        paginationQuery.page,
        paginationQuery.limit,
      );

    return guestbooks;
  }

  /**
   * 전체 방명록의 개수를 조회합니다.
   */
  @Get('count')
  @Private('user')
  async getTotalGuestbooks(@DAccount('user') user: User) {
    return this.guestbooksService.getCount(user.id);
  }

  /**
   * 방명록을 조회합니다.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guestbooksService.getOne(id);
  }

  /**
   * 방명록의 사진 업로드하기 위한 사전 서명된 URL을 조회합니다.
   */
  @Get('presigned-url/:id')
  @Private('user')
  getPresignedUrl(@Param('id') id: string) {
    return this.storageService.getPresignedUrl(`raw/${id}`);
  }

  /**
   * 방명록을 생성합니다.
   */
  @Post()
  @Private('user')
  async create(
    @DAccount('user') user: User,
    @Body() createGuestbookDto: CreateGuestbookDto,
  ) {
    const { id: userId } = user;

    const guestbook = await this.guestbooksService.create(
      userId,
      createGuestbookDto,
    );

    return guestbook;
  }

  /**
   * 방명록 사진을 업로드합니다.
   */
  @Put(':id/photo')
  @UseInterceptors(FileInterceptor('imageFile'))
  @Private('user')
  updatePhoto(
    @DAccount('user') user: User,
    @Param('id') id: string,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    return this.guestbooksService.updatePhoto(id, user.id, imageFile);
  }

  /**
   * 방명록 메시지를 수정합니다.
   */
  @Put(':id')
  updateMessage(
    @Param('id') id: string,
    @Body() updateGuestbookDto: UpdateGuestbookDto,
  ) {
    return this.guestbooksService.updateMessage(id, updateGuestbookDto);
  }

  /**
   * 방명록을 삭제합니다.
   */
  @Delete(':id')
  @Private('user')
  delete(@Param('id') id: string, @DAccount('user') user: User) {
    return this.guestbooksService.delete(id, user.id);
  }
}
