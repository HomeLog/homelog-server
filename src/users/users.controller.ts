import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
import { UsersService } from './users.service';
import { CreateProfileDto, EditProfileDto, SignUpKakaoDto } from './users.dto';
import { Private } from 'src/decorator/private.decorator';
import { DAccount } from 'src/decorator/account.decorator';
import { User } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';
import axios from 'axios';

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
      sameSite: 'none',
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

    const url = 'https://kapi.kakao.com/v2/user/me';
    const userInfo = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    await this.usersService.createUser(
      new SignUpKakaoDto(userInfo.data.id.toString()),
    );

    response.cookie('accessToken', accessToken, this.cookieOptions);
    return response.send({ accessToken });
  }

  @Private('user')
  @Delete('sign-out')
  async signOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken', this.cookieOptions);
    //response.status(204).send();
  }

  @Get('find-profile')
  async getProfile(userId: string) {
    return await this.usersService.getProfileById(userId);
  }

  @Post('create-profile')
  @Private('user')
  @UseInterceptors(FilesInterceptor('images'))
  async createProfile(
    @Body() dto: CreateProfileDto,
    @DAccount('user') user: User,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const profile = await this.usersService.getProfileById(user.id);
    if (profile) throw new BadRequestException('already exist');

    const profileImage = files?.find(
      (file) => file.fieldname === 'profileImage',
    );
    const homeImage = files?.find((file) => file.fieldname === 'homeImage');

    return await this.usersService.createProfile(
      user.id.toString(),
      dto,
      profileImage ? profileImage.path : null,
      homeImage ? homeImage.path : null,
    );
  }

  @Patch('edit-profile')
  @Private('user')
  @UseInterceptors(FilesInterceptor('images'))
  async editProfile(
    @Body() dto: EditProfileDto,
    @DAccount('user') user: User,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const profile = await this.usersService.getProfileById(user.id.toString());
    if (!profile) throw new BadRequestException('not existing profile');

    const profileImage = files?.find(
      (file) => file.fieldname === 'profileImage',
    );
    const homeImage = files?.find((file) => file.fieldname === 'homeImage');

    await this.usersService.editProfile(
      user.id.toString(),
      dto,
      profileImage ? profileImage.path : null,
      homeImage ? homeImage.path : null,
    );

    return await this.usersService.getProfileById(user.id.toString());
  }
}
