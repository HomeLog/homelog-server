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
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { TGuestbookResponse } from 'src/common/types/guestbooks.type';
import { DAccount } from 'src/decorator/account.decorator';
import { Private } from 'src/decorator/private.decorator';
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
   * @description: 방명록 목록 조회
   */
  @Get()
  @Private('user')
  @ApiOperation({
    summary: '방명록 목록 조회',
    description: '방명록 목록을 조회합니다.',
  })
  @ApiCookieAuth()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'size',
    required: false,
    type: Number,
  })
  async findAll(
    @Query()
    paginationQuery: PaginationQueryDto,
    @DAccount('user')
    user: User,
  ) {
    const guestbooks: TGuestbookResponse[] =
      await this.guestbooksService.findGuestbooks(
        user.id,
        paginationQuery.page,
        paginationQuery.limit,
      );

    return guestbooks;
  }

  /**
   * @description: 방명록 개수 조회
   */
  @Get('count')
  @Private('user')
  async getTotalGuestbooks(@DAccount('user') user: User) {
    return this.guestbooksService.getCount(user.id);
  }

  /**
   * @description: 방명록 단건 조회
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guestbooksService.findOne(id);
  }

  @Get('presigned-url/:id')
  @Private('user')
  getPresignedUrl(@Param('id') id: string) {
    return this.storageService.getPresignedUrl(`raw/${id}`);
  }

  /**
   * @description: 방명록 생성
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
   * @description: 방명록 작성
   */
  @Put(':id')
  updateMessage(
    @Param('id') id: string,
    @Body() updateGuestbookDto: UpdateGuestbookDto,
  ) {
    return this.guestbooksService.updateMessage(id, updateGuestbookDto);
  }

  /**
   * @description: 방명록 삭제
   */
  @Delete(':id')
  @Private('user')
  delete(@Param('id') id: string, @DAccount('user') user: User) {
    return this.guestbooksService.delete(id, user.id);
  }
}
