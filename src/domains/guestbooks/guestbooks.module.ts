import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from 'src/storage/storage.module';
import { GuestbooksController } from './guestbooks.controller';
import { GuestbooksRepository } from './guestbooks.repository';
import { GuestbooksService } from './guestbooks.service';

@Module({
  imports: [StorageModule, ConfigModule],
  controllers: [GuestbooksController],
  providers: [GuestbooksService, GuestbooksRepository],
})
export class GuestbooksModule {}
