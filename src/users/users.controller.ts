import { Controller, Delete, Get, Query, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { CookieOptions, Response } from 'express';

@Controller('users')
export class UsersController {
  private readonly cookieOptions: CookieOptions;
  constructor(private readonly usersService: UsersService) {
    this.cookieOptions = {
      maxAge: 1000 * 60 * 15,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    };
  }

  @Get('kakao')
  kakaoLogIn(@Res() response: Response) {
    const url = this.usersService.getKakaoCode();
    return response.redirect(url);
  }

  @Get('kakao/callback')
  async kakaoCallback(@Query('code') code: string, @Res() response: Response) {
    const accessToken = await this.usersService.kakaoLogIn(code);
    response.cookie('accessToken', accessToken, this.cookieOptions);
    return response.send({ accessToken });
  }

  @Delete('sign-out')
  async signOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken', this.cookieOptions);
    return response.sendStatus(204);
  }
}
