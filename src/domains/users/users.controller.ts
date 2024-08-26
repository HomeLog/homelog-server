import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
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
import { ApiCreatedResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DAccount } from 'src/decorator/account.decorator';
import { Private } from 'src/decorator/private.decorator';
import { StorageService } from 'src/storage/storage.service';
import { EditProfileDto, SignUpKakaoDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  private jwtSecret: string;
  private readonly cookieOptions: CookieOptions;

  constructor(
    private readonly usersService: UsersService,
    private configService: ConfigService,
    @Inject('StorageService')
    private readonly storageService: StorageService,
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
  @ApiOperation({
    summary: '인가 코드 발급',
    description: '카카오 로그인시 필요한 인가 코드를 발급합니다.',
  })
  kakaoSignIn(@Res() response: Response) {
    const url = this.usersService.getKakaoCode();

    response.redirect(url);
  }

  @Get('kakao/callback')
  @ApiOperation({
    summary: '액세스 토큰 코드 발급',
    description:
      '카카오 회원가입시 유저와 프로필을 동시에 생성하고, 발급되는 액세스토큰을 반환합니다.',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    type: String,
  })
  @ApiCreatedResponse({
    description: '발급된 액세스토큰을 반환한다.',
    type: String,
  })
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
      userInfo,
    );

    const homeLogAccessToken = jwt.sign({}, this.jwtSecret, {
      subject: user.id,
    });

    response.cookie('accessToken', homeLogAccessToken, this.cookieOptions);

    return response.send({ homeLogAccessToken });
  }

  @Private('user')
  @Delete('sign-out')
  @ApiOperation({
    summary: '로그아웃',
    description: '쿠키를 만료시켜 로그아웃합니다.',
  })
  async signOut(@Res({ passthrough: true }) response: Response) {
    return response.clearCookie('accessToken', this.cookieOptions).status(204);
  }

  @Private('user')
  @Get('sign-in-status')
  @ApiOperation({
    summary: '로그인 확인',
    description:
      '로그인된 상태인지 확인합니다. 로그인 상태일 경우 true를 반환합니다.',
  })
  isSignedIn() {
    return true;
  }

  @Get('user')
  @ApiOperation({
    summary: '유저 확인',
    description: '유저를 탐색하여 존재하는 유저라면 정보를 반환합니다.',
  })
  async getUser(userId: string) {
    const user = await this.usersService.findUserById(userId);

    if (!user) throw new NotFoundException('no user');

    return user;
  }

  @Private('user')
  @Get('profile')
  @ApiOperation({
    summary: '프로필 확인',
    description:
      '유저를 탐색하여 프로필이 존재하는 유저라면 프로필 정보를 반환합니다.',
  })
  async getProfile(@DAccount('user') user: User) {
    const profile = await this.usersService.getProfileById(user.id);

    if (!profile) throw new NotFoundException('no profile');
    else return profile;
  }

  @Put('profile')
  @Private('user')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatarImage', maxCount: 1 },
      { name: 'homeImage', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: '프로필 수정',
    description: '프로필을 수정합니다.',
  })
  async editProfile(
    @Body() dto: EditProfileDto,
    @DAccount('user') user: User,
    @UploadedFiles()
    files: {
      avatarImage?: Express.Multer.File[];
      homeImage?: Express.Multer.File[];
    },
  ) {
    const profile = await this.usersService.getProfileById(user.id.toString());
    if (!profile) throw new BadRequestException('not existing profile');

    const { avatarImage, homeImage } = {
      avatarImage: files?.avatarImage?.pop(),
      homeImage: files?.homeImage?.pop(),
    };

    const [avatarImageKey, homeImageKey] = await Promise.all([
      this.storageService.uploadFile(avatarImage),
      this.storageService.uploadFile(homeImage),
    ]);

    return await this.usersService.editProfile(
      user.id.toString(),
      dto,
      avatarImageKey,
      homeImageKey,
    );
  }

  @Private('user')
  @Delete('profile/:imageType')
  @ApiOperation({
    summary: '기본이미지로 변경',
    description:
      '이미지 타입에 따라 홈 사진 또는 프로필 사진을 삭제하고, 기본 이미지로 변경합니다.',
  })
  async deleteImage(
    @DAccount('user') user: User,
    @Param('imageType') imageType: string,
  ) {
    await this.usersService.deleteImage(user.id, imageType === 'avatar');
  }
}
