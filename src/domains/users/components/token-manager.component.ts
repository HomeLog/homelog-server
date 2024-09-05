import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { DToken, TToken } from 'src/common/types/token.type';

@Injectable()
export class TokenManagerComponent {
  private readonly jwtSecret: string;
  private readonly tokenExpiration = {
    accessToken: {
      expiresInLiteral: '15m',
      expiresInNumber: 1000 * 60 * 15,
    },
    refreshToken: {
      expiresInLiteral: '30d',
      expiresInNumber: 1000 * 60 * 60 * 24 * 30,
    },
  };

  constructor(private readonly configService: ConfigService) {
    this.jwtSecret = this.configService.getOrThrow('JWT_SECRET');
  }

  generateToken(name: TToken, subject: string): DToken {
    return {
      name,
      value: jwt.sign({}, this.jwtSecret, {
        subject: subject,
        expiresIn: {
          accessToken: this.tokenExpiration.accessToken.expiresInLiteral,
          refreshToken: this.tokenExpiration.refreshToken.expiresInLiteral,
        }[name],
      }),
      maxAge: {
        accessToken: this.tokenExpiration.accessToken.expiresInNumber,
        refreshToken: this.tokenExpiration.refreshToken.expiresInNumber,
      }[name],
    };
  }

  generateTokens(userId: string): {
    accessToken: DToken;
    refreshToken: DToken;
  } {
    return {
      accessToken: this.generateToken('accessToken', userId),
      refreshToken: this.generateToken('refreshToken', userId),
    };
  }

  verifyTokenValue(token: string) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);

      if (typeof decoded.sub !== 'string') throw new Error('Invalid token');

      return { decoded, subject: decoded.sub };
    } catch (e) {
      throw e;
    }
  }
}
