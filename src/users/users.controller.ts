import { Controller, Delete, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
import { UsersService } from './users.service';

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
    response.cookie('accessToken', accessToken, this.cookieOptions);
    return response.send({ accessToken });
  }

  @Delete('sign-out')
  async signOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken', this.cookieOptions);
    return response.sendStatus(204);
  }
}
