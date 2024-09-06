import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { TAccount } from 'src/common/types/account.type';
import { UsersService } from 'src/domains/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly jwtSecret: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.getOrThrow('JWT_SECRET');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const accountTypeInDecorator = this.reflector.getAllAndOverride<TAccount>(
      'accountType',
      [context.getHandler(), context.getClass()],
    );

    if (accountTypeInDecorator === undefined) return true;

    const request = context.switchToHttp().getRequest();
    const accessToken = request.cookies['accessToken'];

    if (!accessToken)
      throw new UnauthorizedException('Access token is missing');

    const decodedToken = this.verifyToken(accessToken);
    const user = await this.usersService.findUserById(
      decodedToken.sub as string,
    );

    if (!user) throw new UnauthorizedException('User not found');

    request.user = user;
    return true;
  }

  private verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
