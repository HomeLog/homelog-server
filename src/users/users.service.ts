import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class UsersService {
  private readonly REST_API_KEY = process.env.REST_API_KEY;
  private readonly REDIRECT_URI = process.env.REDIRECT_URI;

  getKakaoCode() {
    return `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${this.REST_API_KEY}&redirect_uri=${this.REDIRECT_URI}`;
  }

  async kakaoLogIn(code: string): Promise<string> {
    const url = 'https://kauth.kakao.com/oauth/token';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.REST_API_KEY,
      redirect_uri: this.REDIRECT_URI,
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

  async kakaoLogout(ACCESS_TOKEN: string) {
    const url = 'https://kapi.kakao.com/v1/user/logout';
    const header = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    };
    await axios.post(url, null, { headers: header });
    return true;
  }
}
