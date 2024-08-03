import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Service } from './aws.service';
import { MinioService } from './minio.service';

@Module({
  providers: [
    {
      provide: 'StorageService',
      useFactory: (configService: ConfigService) => {
        return configService.get('NODE_ENV') === 'production'
          ? new S3Service(configService)
          : new MinioService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['StorageService'],
  imports: [ConfigModule],
})
export class StorageModule {}
