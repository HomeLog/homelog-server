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
  UnauthorizedException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CookieOptions, Response } from 'express';
import { DAccount, DCookie, Private } from 'src/common/decorators';
import { TTokenInfo } from 'src/common/types/token.type';
import { StorageService } from 'src/storage/storage.service';
import {
  DocsUsersDeleteImage,
  DocsUsersEditProfile,
  DocsUsersGetProfile,
  DocsUsersGetUser,
  DocsUsersIsSignedIn,
  DocsUsersKakaoCallback,
  DocsUsersKakaoSignIn,
  DocsUsersSignOut,
} from './decorators/docs-users.decorator';
import { EditProfileDto } from './users.dto';
import { UsersService } from './users.service';

@ApiTags('유저 API')
@Controller('users')
export class UsersController {
  private readonly cookieOptions: CookieOptions;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    @Inject('StorageService')
    private readonly storageService: StorageService,
  ) {
    this.cookieOptions = {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      ...(this.configService.get('NODE_ENV') === 'production' && {
        sameSite: 'none',
        secure: true,
      }),
    };
  }

  private setTokenCookie(response: Response, token: TTokenInfo) {
    response.cookie(token.name, token.value, {
      ...this.cookieOptions,
      maxAge: token.maxAge,
    });
  }

  private clearAuthCookies(response: Response) {
    response.clearCookie('accessToken', this.cookieOptions);
    response.clearCookie('refreshToken', this.cookieOptions);
  }

  @Get('kakao')
  @DocsUsersKakaoSignIn()
  kakaoSignIn(@Res() response: Response) {
    const url = this.usersService.getKakaoCode();

    response.redirect(url);
  }

  @Get('kakao/callback')
  @DocsUsersKakaoCallback()
  async kakaoCallback(
    @Query('code') code: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.usersService.createUserByKakao(code);

    const { accessToken, refreshToken } = this.usersService.generateTokens(
      user.id,
    );

    this.setTokenCookie(response, accessToken);
    this.setTokenCookie(response, refreshToken);

    return { accessToken };
  }

  @Get('/refresh')
  async refresh(
    @DCookie('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const { accessToken: newAccessToken, refreshToken: rotatedRefreshToken } =
        await this.usersService.regenerateTokens(refreshToken);

      this.setTokenCookie(response, newAccessToken);
      this.setTokenCookie(response, rotatedRefreshToken);

      return { accessToken: newAccessToken };
    } catch (error) {
      this.clearAuthCookies(response);
      throw new UnauthorizedException('invalid refresh token');
    }
  }

  @Private('user')
  @Delete('sign-out')
  @DocsUsersSignOut()
  async signOut(@Res({ passthrough: true }) response: Response) {
    this.clearAuthCookies(response);
    response.status(204);
  }

  @Private('user')
  @Get('sign-in-status')
  @DocsUsersIsSignedIn()
  isSignedIn() {
    return true;
  }

  @Get('user')
  @DocsUsersGetUser()
  async getUser(userId: string) {
    const user = await this.usersService.findUserById(userId);

    if (!user) throw new NotFoundException('no user');

    return user;
  }

  @Private('user')
  @Get('profile')
  @DocsUsersGetProfile()
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
  @DocsUsersEditProfile()
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
  @DocsUsersDeleteImage()
  async deleteImage(
    @DAccount('user') user: User,
    @Param('imageType') imageType: string,
  ) {
    await this.usersService.deleteImage(user.id, imageType === 'avatar');
  }
}
