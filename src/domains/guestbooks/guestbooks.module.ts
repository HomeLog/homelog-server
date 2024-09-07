import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from 'src/storage/storage.module';
import { GuestbooksRepository } from './components/guestbooks.repository';
import { GuestbooksController } from './guestbooks.controller';
import { GuestbooksService } from './guestbooks.service';

@Module({
  imports: [StorageModule, ConfigModule],
  controllers: [GuestbooksController],
  providers: [GuestbooksService, GuestbooksRepository],
})
export class GuestbooksModule {}
