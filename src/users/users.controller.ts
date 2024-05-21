import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
import { UsersService } from './users.service';
import { CreateProfileDto, SignUpKakaoDto } from './users.dto';
import { Private } from 'src/decorator/private.decorator';
import { DAccount } from 'src/decorator/account.decorator';
import { User } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  private readonly cookieOptions: CookieOptions;
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.cookieOptions = {
      maxAge: 1000 * 60 * 15,
      httpOnly: true,
      sameSite: 'lax',
      secure: this.configService.get('NODE_ENV') === 'production',
    };
  }

  @Get('kakao')
  kakaoSignIn(@Res() response: Response) {
    const url = this.usersService.getKakaoCode();

    return response.redirect(url);
  }

  @Get('kakao/callback')
  async kakaoCallback(@Query('code') code: string, @Res() response: Response) {
    const accessToken = await this.usersService.kakaoSignIn(code);

    await this.usersService.createUser(new SignUpKakaoDto(accessToken));

    response.cookie('accessToken', accessToken, this.cookieOptions);
    return response.send({ accessToken });
  }

  @Get()
  async findUsers() {
    return await this.usersService.findUsers();
  }

  @Private('user')
  @Delete('sign-out')
  async signOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken', this.cookieOptions);
    return response.sendStatus(204);
  }

  @Get('find-profile')
  async getProfile(userId: string) {
    return await this.usersService.getProfileById(userId);
    //3486489335
  }

  @Post('profile')
  @Private('user')
  @UseInterceptors(FilesInterceptor('images'))
  async createProfile(
    @Body() dto: CreateProfileDto,
    @DAccount('user') user: User,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const profileImage = files?.find(
      (file) => file.fieldname === 'profileImage',
    );
    const homeImage = files?.find((file) => file.fieldname === 'homeImage');

    console.log('id: ', user.id);
    return await this.usersService.createProfile(
      user.id,
      dto,
      profileImage ? profileImage.path : null,
      homeImage ? homeImage.path : null,
    );
  }
}
