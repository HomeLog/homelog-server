import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import axios from 'axios';
import { CookieOptions, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { getFilePath, getLocalStorage } from 'src/common/utils/file.util';
import { DAccount } from 'src/decorator/account.decorator';
import { Private } from 'src/decorator/private.decorator';
import ProfileImageUploadInterceptor from 'src/interceptors/profile-image-upload.interceptor';
import { CreateProfileDto, EditProfileDto, SignUpKakaoDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  private jwtSecret: string;
  private readonly cookieOptions: CookieOptions;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.cookieOptions = {
      maxAge: 1000 * 60 * 15,
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      ...(this.configService.get('NODE_ENV') === 'production' && {
        sameSite: 'none',
        secure: true,
      }),
    };

    this.jwtSecret = this.configService.getOrThrow('JWT_SECRET');
  }

  @Get('kakao')
  kakaoSignIn(@Res() response: Response) {
    const url = this.usersService.getKakaoCode();

    return response.redirect(url);
  }

  @Get('kakao/callback')
  async kakaoCallback(@Query('code') code: string, @Res() response: Response) {
    const kakaoAccessToken = await this.usersService.kakaoSignIn(code);

    const url = 'https://kapi.kakao.com/v2/user/me';

    const userInfo = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${kakaoAccessToken}`,
      },
    });

    const user = await this.usersService.createUser(
      new SignUpKakaoDto(userInfo.data.id.toString()),
    );

    const homeLogAccessToken = jwt.sign({}, this.jwtSecret, {
      subject: user.id,
    });

    response.cookie('accessToken', homeLogAccessToken, this.cookieOptions);
    return response.send({ homeLogAccessToken });
  }

  @Private('user')
  @Delete('sign-out')
  async signOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken', this.cookieOptions);
    response.status(204).send();
  }

  @Get('find-user')
  async getUser(userId: string) {
    const user = await this.usersService.findUserById(userId);

    if (!user) throw new NotFoundException('no user');

    return user;
  }

  @Get('find-profile')
  async getProfile(userId: string) {
    const profile = await this.usersService.getProfileById(userId);

    if (!profile) throw new NotFoundException('no profile');
    else return profile;
  }

  @Post('create-profile')
  @Private('user')
  @HttpCode(HttpStatus.CREATED)
  @ProfileImageUploadInterceptor({
    storage: getLocalStorage(),
  })
  async createProfile(
    @Body() dto: CreateProfileDto,
    @DAccount('user') user: User,
    @UploadedFiles()
    files: {
      profileImage?: Express.Multer.File;
      homeImage?: Express.Multer.File;
    },
  ) {
    const profile = await this.usersService.getProfileById(user.id);
    if (profile) throw new BadRequestException('already exist');

    const [profileImagePath, homeImagePath] = await Promise.all([
      getFilePath(files.profileImage),
      getFilePath(files.homeImage),
    ]);

    return await this.usersService.createProfile(
      user.id.toString(),
      dto,
      profileImagePath,
      homeImagePath,
    );
  }

  @Patch('edit-profile')
  @Private('user')
  @ProfileImageUploadInterceptor({
    storage: getLocalStorage(),
  })
  async editProfile(
    @Body() dto: EditProfileDto,
    @DAccount('user') user: User,
    @UploadedFiles()
    files: {
      profileImage?: Express.Multer.File;
      homeImage?: Express.Multer.File;
    },
  ) {
    const profile = await this.usersService.getProfileById(user.id.toString());
    if (!profile) throw new BadRequestException('not existing profile');

    const profileImagePath = files.profileImage
      ? await getFilePath(files.profileImage[0])
      : null;
    const homeImagePath = files.homeImage
      ? await getFilePath(files.homeImage[0])
      : null;

    const updatedProfile = await this.usersService.editProfile(
      user.id.toString(),
      dto,
      profileImagePath,
      homeImagePath,
    );

    return updatedProfile;
  }
}
