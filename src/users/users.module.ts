import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ConfigService } from '@nestjs/config';
import { AuthMiddleware } from 'src/middleware/auth.middleware';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ConfigService],
  imports: [],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'users/profile', method: RequestMethod.POST });
  }
}
