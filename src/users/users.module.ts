import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ConfigService],
  imports: [],
})
export class UsersModule {}
