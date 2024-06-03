import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SuccessInterceptor } from './common/success-response.interceptor';
import { PrismaModule } from './database/prisma/prisma.module';
import { GlobalExceptionFilter } from './exceptions/global-exception.filter';
import { AuthGuard } from './guard/auth.guard';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { S3Service } from './users/storage/aws.service';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';

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
