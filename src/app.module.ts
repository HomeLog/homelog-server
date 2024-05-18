import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { SuccessInterceptor } from './common/success-response.interceptor';
import { GlobalExceptionFilter } from './exceptions/global-exception.filter';
import { AuthGuard } from './guard/auth.guard';
import { UsersModule } from './users/users.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [UsersModule],
  controllers: [AppController, UsersController],
  providers: [
    AppService,
    UsersService,
    ConfigService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
