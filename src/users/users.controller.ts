import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Put,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import axios from 'axios';
import { CookieOptions, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { getFilePath } from 'src/common/utils/file.util';
import { DAccount } from 'src/decorator/account.decorator';
import { Private } from 'src/decorator/private.decorator';
import { CreateProfileDto, EditProfileDto, SignUpKakaoDto } from './users.dto';
import { UsersService } from './users.service';
import { FormDataRequest } from 'nestjs-form-data';
import { S3Service } from './storage/aws.service';
import { ProfileImageUploadInterceptor } from 'src/interceptors/profile-image-upload.interceptor';

@Controller('users')
export class UsersController {
  private jwtSecret: string;
  private readonly cookieOptions: CookieOptions;

  constructor(
    private readonly usersService: UsersService,
    private configService: ConfigService,
    private readonly s3Service: S3Service,
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

  @Post('profile')
  @Private('user')
  @HttpCode(HttpStatus.CREATED)
  @FormDataRequest()
  @UseInterceptors(ProfileImageUploadInterceptor)
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

  @Put('profile')
  @Private('user')
  @FormDataRequest()
  @UseInterceptors(ProfileImageUploadInterceptor)
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

    const [profileImagePath, homeImagePath] = await Promise.all([
      getFilePath(files?.profileImage),
      getFilePath(files?.homeImage),
    ]);

    if (files) {
      if (files.profileImage) {
        console.log(1);
        await this.s3Service.uploadFile(files.profileImage);
      }
      if (files.homeImage) {
        await this.s3Service.uploadFile(files.homeImage);
      }
    }

    return await this.usersService.editProfile(
      user.id.toString(),
      dto,
      profileImagePath,
      homeImagePath,
    );
  }
}
