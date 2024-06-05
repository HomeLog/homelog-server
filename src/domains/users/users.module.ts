import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { ProfileImageUploadInterceptor } from 'src/common/interceptors/profile-image-upload.interceptor';
import { S3Module } from '../../storage/aws.module';
import { S3Service } from '../../storage/aws.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

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
