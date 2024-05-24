import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { S3Module } from './storage/aws.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ConfigService],
  imports: [S3Module],
})
export class UsersModule {}
