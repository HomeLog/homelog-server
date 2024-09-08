import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { TTokenInfo, TTokenType } from 'src/common/types/token.type';
import { UsersRepositoryComponent } from './components/users-repository.component';
import {
  InvalidUserTokenException,
  UserNotFoundException,
} from './users.exception';

@Injectable()
export class TokenManagerService {
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

  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepositoryComponent: UsersRepositoryComponent,
  ) {
    this.jwtSecret = this.configService.getOrThrow('JWT_SECRET');
  }

  private generateToken(name: TTokenType, subject: string): TTokenInfo {
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
    accessToken: TTokenInfo;
    refreshToken: TTokenInfo;
  } {
    return {
      accessToken: this.generateToken('accessToken', userId),
      refreshToken: this.generateToken('refreshToken', userId),
    };
  }

  verifyTokenValue(token: string) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);

      if (typeof decoded.sub !== 'string')
        throw new InvalidUserTokenException();

      return { decoded, subject: decoded.sub };
    } catch (e) {
      throw new InvalidUserTokenException();
    }
  }

  async regenerateTokens(refreshToken: string) {
    try {
      const { subject: userId } = this.verifyTokenValue(refreshToken);

      const user = await this.usersRepositoryComponent.findOneUser(userId);

      if (!user) throw new UserNotFoundException();

      const tokens = this.generateTokens(userId);

      return tokens;
    } catch (error) {
      throw error;
    }
  }
}
