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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import axios from 'axios';
import { CookieOptions, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { DAccount } from 'src/decorator/account.decorator';
import { Private } from 'src/decorator/private.decorator';
import { CreateProfileDto, EditProfileDto, SignUpKakaoDto } from './users.dto';
import { UsersService } from './users.service';
import { diskStorage } from 'multer';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
  },
});

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

    if (!user) throw new BadRequestException('no user');
    else return user;
  }

  @Get('find-profile')
  async getProfile(userId: string) {
    const profile = await this.usersService.getProfileById(userId);

    if (!profile) throw new BadRequestException('no profile');
    else return profile;
  }

  @Post('create-profile')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profileImage', maxCount: 1 },
        { name: 'homeImage', maxCount: 1 },
      ],
      { storage },
    ),
  )
  @Private('user')
  async createProfile(
    @Body() dto: CreateProfileDto,
    @DAccount('user') user: User,
    @UploadedFiles()
    files: {
      profileImage?: Express.Multer.File[];
      homeImage?: Express.Multer.File[];
    },
  ) {
    const profile = await this.usersService.getProfileById(user.id);
    if (profile) throw new BadRequestException('already exist');

    const profileImage = files.profileImage ? files.profileImage[0] : null;
    const homeImage = files.homeImage ? files.homeImage[0] : null;

    return await this.usersService.createProfile(
      user.id.toString(),
      dto,
      profileImage ? profileImage.path : null,
      homeImage ? homeImage.path : null,
    );
  }

  @Patch('edit-profile')
  @Private('user')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profileImage', maxCount: 1 },
        { name: 'homeImage', maxCount: 1 },
      ],
      { storage },
    ),
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

    const profileImage = files.profileImage ? files.profileImage[0] : null;
    const homeImage = files.homeImage ? files.homeImage[0] : null;

    await this.usersService.editProfile(
      user.id.toString(),
      dto,
      profileImage ? profileImage.path : null,
      homeImage ? homeImage.path : null,
    );

    return await this.usersService.getProfileById(user.id.toString());
  }
}
