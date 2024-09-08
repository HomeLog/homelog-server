import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from 'src/storage/storage.module';
import { GuestbooksConverterComponent } from './components/guestbooks-converter.component';
import { GuestbooksRepositoryComponent } from './components/guestbooks-repository.component';
import { GuestbooksValidatorComponent } from './components/guestbooks-validator.component';
import { GuestbooksController } from './guestbooks.controller';
import { GuestbooksService } from './guestbooks.service';

@Module({
  imports: [StorageModule, ConfigModule],
  controllers: [GuestbooksController],
  providers: [
    GuestbooksService,
    GuestbooksConverterComponent,
    GuestbooksValidatorComponent,
    GuestbooksRepositoryComponent,
  ],
})
export class GuestbooksModule {}
