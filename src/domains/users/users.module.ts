import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { ProfileImageUploadInterceptor } from 'src/common/interceptors/profile-image-upload.interceptor';
import { StorageModule } from '../../storage/storage.module';
import { KakaoAuthComponent } from './components/kakao-auth.component';
import { TokenManagerComponent } from './components/token-manager.component';
import { UsersRepository } from './components/users.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    ConfigService,
    ProfileImageUploadInterceptor,
    KakaoAuthComponent,
    TokenManagerComponent,
    UsersRepository,
  ],
  imports: [HttpModule, StorageModule, NestjsFormDataModule],
  exports: [UsersService, KakaoAuthComponent],
})
export class UsersModule {}
