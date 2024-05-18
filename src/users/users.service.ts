import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class UsersService {
  private readonly restApiKey: string;
  private readonly redirectUri: string;

  constructor(private readonly configService: ConfigService) {
    this.restApiKey = this.getConfigValue('REST_API_KEY');
    this.redirectUri = this.getConfigValue('REDIRECT_URI');
  }

  private getConfigValue(key: string): string {
    const value = this.configService.get(key);

    if (!value) throw new Error(`${key} is missing`);

    return value;
  }

  getKakaoCode() {
    return `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${this.restApiKey}&redirect_uri=${this.redirectUri}`;
  }

  async kakaoSignIn(code: string): Promise<string> {
    const url = 'https://kauth.kakao.com/oauth/token';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.restApiKey,
      redirect_uri: this.redirectUri,
      code,
    });

    const header = {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };

    const response = await axios.post(url, params, {
      headers: header,
    });
    return response.data.access_token;
  }

  async kakaoSignOut(ACCESS_TOKEN: string) {
    const url = 'https://kapi.kakao.com/v1/user/logout';
    const header = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    };
    await axios.post(url, null, { headers: header });
    return true;
  }
}
