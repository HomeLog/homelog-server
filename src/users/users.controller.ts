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
import { FilesInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import axios from 'axios';
import { CookieOptions, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { DAccount } from 'src/decorator/account.decorator';
import { Private } from 'src/decorator/private.decorator';
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

    const jwtSecret = this.configService.get('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is missing');
    }

    this.jwtSecret = jwtSecret;
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
