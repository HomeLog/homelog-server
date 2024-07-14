import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Module } from 'src/storage/aws.module';
import { S3Service } from 'src/storage/aws.service';
import { GuestbooksController } from './guestbooks.controller';
import { GuestbooksRepository } from './guestbooks.repository';
import { GuestbooksService } from './guestbooks.service';

@Module({
  imports: [S3Module, ConfigModule],
  controllers: [GuestbooksController],
  providers: [GuestbooksService, S3Service, GuestbooksRepository],
})
export class GuestbooksModule {}
