import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { StorageModule } from '../../storage/storage.module';
import { KakaoAuthComponent } from './components/kakao-auth.component';
import { UsersRepositoryComponent } from './components/users-repository.component';
import { UsersStorageComponent } from './components/users-storage.component';
import { TokenManagerService } from './token-manager.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    ConfigService,
    TokenManagerService,
    KakaoAuthComponent,
    UsersStorageComponent,
    UsersRepositoryComponent,
  ],
  imports: [HttpModule, StorageModule, NestjsFormDataModule],
  exports: [UsersService, KakaoAuthComponent],
})
export class UsersModule {}
