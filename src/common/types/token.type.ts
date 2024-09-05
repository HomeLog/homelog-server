export type TToken = 'accessToken' | 'refreshToken';

export interface DToken {
  name: TToken;
  value: string;
  maxAge: number;
}
