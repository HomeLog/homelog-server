import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KakaoAuthComponent {
  private readonly restApiKey: string;
  private readonly redirectUri: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.restApiKey = this.configService.getOrThrow('REST_API_KEY');
    this.redirectUri = this.configService.getOrThrow('REDIRECT_URI');
  }

  getKakaoCode() {
    return `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${this.restApiKey}&redirect_uri=${this.redirectUri}`;
  }

  async signIn(oAuthCode: string) {
    const url = 'https://kauth.kakao.com/oauth/token';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.restApiKey,
      redirect_uri: this.redirectUri,
      code: oAuthCode,
    });

    const header = {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };

    const { data } = await firstValueFrom(
      this.httpService.post(url, params, {
        headers: header,
      }),
    );

    return data.access_token;
  }

  async signOut(oAuthAccessToken: string): Promise<boolean> {
    try {
      const url = 'https://kapi.kakao.com/v1/user/logout';
      const header = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${oAuthAccessToken}`,
      };
      await firstValueFrom(
        this.httpService.post(url, null, { headers: header }),
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async userInfo(oAuthAccessToken: string) {
    const url = 'https://kapi.kakao.com/v2/user/me';

    const { data: userInfo } = await firstValueFrom(
      this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${oAuthAccessToken}`,
        },
      }),
    );

    return userInfo;
  }
}
