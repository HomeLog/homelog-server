import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { ProfileImageUploadInterceptor } from 'src/common/interceptors/profile-image-upload.interceptor';
import { StorageModule } from '../../storage/storage.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ConfigService, ProfileImageUploadInterceptor],
  imports: [StorageModule, NestjsFormDataModule],
})
export class UsersModule {}
