import { Module } from '@nestjs/common';
import { S3Service } from './aws.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [S3Service],
  exports: [S3Service],
  imports: [ConfigModule],
})
export class S3Module {}
