export type TTokenType = 'accessToken' | 'refreshToken';

export interface TTokenInfo {
  name: TTokenType;
  value: string;
  maxAge: number;
}
