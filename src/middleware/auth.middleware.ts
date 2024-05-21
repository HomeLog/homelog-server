import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies['accessToken'];

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    const user = await this.usersService.validateToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    req.user = user;
    next();
  }
}
