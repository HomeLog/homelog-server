import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DAccount } from 'src/decorator/account.decorator';
import { Private } from 'src/decorator/private.decorator';
import { S3Service } from '../../storage/aws.service';
import { EditProfileDto, SignUpKakaoDto } from './users.dto';
import { UsersService } from './users.service';

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

    response.redirect(url);
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
      kakaoAccessToken,
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

  @Private('user')
  @Get('sign-in-status')
  isSignedIn() {
    return true;
  }

  @Get('user')
  async getUser(userId: string) {
    const user = await this.usersService.findUserById(userId);

    if (!user) throw new NotFoundException('no user');

    return user;
  }

  @Private('user')
  @Get('profile')
  async getProfile(@DAccount('user') user: User) {
    const profile = await this.usersService.getProfileById(user.id);

    if (!profile) throw new NotFoundException('no profile');
    else return profile;
  }

  @Put('profile')
  @Private('user')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profileImage', maxCount: 1 },
      { name: 'homeImage', maxCount: 1 },
    ]),
  )
  async editProfile(
    @Body() dto: EditProfileDto,
    @DAccount('user') user: User,
    @UploadedFiles()
    files: {
      profileImage?: Express.Multer.File[];
      homeImage?: Express.Multer.File[];
    },
  ) {
    const profile = await this.usersService.getProfileById(user.id.toString());
    if (!profile) throw new BadRequestException('not existing profile');

    const { profileImage, homeImage } = {
      profileImage: files?.profileImage?.pop(),
      homeImage: files?.homeImage?.pop(),
    };

    const [profileImagePath, homeImagePath] = await Promise.all([
      this.s3Service.uploadFile(profileImage),
      this.s3Service.uploadFile(homeImage),
    ]);

    return await this.usersService.editProfile(
      user.id.toString(),
      dto,
      profileImagePath,
      homeImagePath,
    );
  }
}
