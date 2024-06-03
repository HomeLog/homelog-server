import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { SuccessInterceptor } from './common/interceptors/success-response.interceptor';
import { PrismaModule } from './database/prisma/prisma.module';
import { S3Service } from './domains/users/storage/aws.service';
import { UsersController } from './domains/users/users.controller';
import { UsersModule } from './domains/users/users.module';
import { UsersService } from './domains/users/users.service';
import { AuthGuard } from './guard/auth.guard';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    NestjsFormDataModule,
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
  ],
  controllers: [AppController, UsersController],
  providers: [
    AppService,
    UsersService,
    S3Service,
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
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: ProfileImageUploadInterceptor,
    // },
  ],
})
export class AppModule {}
