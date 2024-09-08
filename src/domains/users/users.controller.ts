import {
  Body,
  Controller,
  Delete,
  Get,
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
import { ErrorCodes } from 'src/common/errors/error-codes';
import { TTokenInfo } from 'src/common/types/token.type';
import { TUserProfileImages } from 'src/common/types/users.type';
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
import { TokenManagerService } from './token-manager.service';
import { EditProfileDto } from './users.dto';
import { UsersService } from './users.service';

@ApiTags('유저 API')
@Controller('users')
export class UsersController {
  private readonly cookieOptions: CookieOptions;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly tokenManagerService: TokenManagerService,
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

  private setAuthCookie(response: Response, token: TTokenInfo) {
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

    const { accessToken, refreshToken } =
      this.tokenManagerService.generateTokens(user.id);

    this.setAuthCookie(response, accessToken);
    this.setAuthCookie(response, refreshToken);

    return { accessToken };
  }

  @Get('/refresh')
  async refresh(
    @DCookie('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const { accessToken: newAccessToken, refreshToken: rotatedRefreshToken } =
        await this.tokenManagerService.regenerateTokens(refreshToken);

      this.setAuthCookie(response, newAccessToken);
      this.setAuthCookie(response, rotatedRefreshToken);

      return { accessToken: newAccessToken };
    } catch (error) {
      this.clearAuthCookies(response);
      throw new UnauthorizedException(ErrorCodes.INVALID_USER_TOKEN.message);
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
    return await this.usersService.getUser(userId);
  }

  @Private('user')
  @Get('profile')
  @DocsUsersGetProfile()
  async getProfile(@DAccount('user') user: User) {
    return await this.usersService.getProfile(user.id);
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
    files: TUserProfileImages,
  ) {
    return await this.usersService.editProfile(user.id, dto, files);
  }

  @Private('user')
  @Delete('profile/:imageType')
  @DocsUsersDeleteImage()
  async deleteImage(
    @DAccount('user') user: User,
    @Param('imageType') imageType: 'avatar' | 'home',
  ) {
    await this.usersService.deleteImage(user.id, `${imageType}ImageKey`);
  }
}
