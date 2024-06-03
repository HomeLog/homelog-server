import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { S3Module } from './storage/aws.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { S3Service } from './storage/aws.service';
import { ProfileImageUploadInterceptor } from 'src/common/interceptors/profile-image-upload.interceptor';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    ConfigService,
    S3Service,
    ProfileImageUploadInterceptor,
  ],
  imports: [S3Module, NestjsFormDataModule],
})
export class UsersModule {}
