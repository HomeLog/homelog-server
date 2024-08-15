import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import * as MinIO from 'minio';
import { nanoid } from 'nanoid';
import { StorageService } from './storage.service';

@Injectable()
export class MinioService implements StorageService {
  private bucketName: string;
  private client: MinIO.Client;
  private mqChannelWrapper: ChannelWrapper;

  constructor(private readonly configService: ConfigService) {
    const rabbitMQEndpoint =
      this.configService.get('RABBITMQ_ENDPOINT') ?? 'rabbitmq';
    const rabbitMQConnection = amqp.connect([
      `amqp://${rabbitMQEndpoint}:5672`,
    ]);
    this.mqChannelWrapper = rabbitMQConnection.createChannel({
      setup: (channel: {
        assertQueue: (arg0: string, arg1: { durable: boolean }) => void;
      }) => {
        channel.assertQueue('resize-message-queue', {
          durable: true,
        });
      },
      json: true,
    });

    this.client = new MinIO.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT') ?? '',
      port: parseInt(this.configService.get('MINIO_PORT') ?? '9000'),
      useSSL: false,
      accessKey: this.configService.get('MINIO_ACCESS_KEY') ?? '',
      secretKey: this.configService.get('MINIO_SECRET_KEY') ?? '',
    });

    try {
      this.bucketName = this.configService.getOrThrow('MINIO_BUCKET_NAME');
    } catch (error) {
      throw new Error('MINIO_BUCKET_NAME is not set');
    }
  }
  async getPresignedUrl(key: string): Promise<string | undefined> {
    const presignedUrl = await this.client.presignedPutObject(
      this.bucketName,
      key,
      60,
    );

    return presignedUrl;
  }

  private async addToResizeMessageQueue(imageKey: string) {
    try {
      await this.mqChannelWrapper.sendToQueue('resize-message-queue', {
        imageKey,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async uploadFile(
    file: Express.Multer.File | undefined,
  ): Promise<string | undefined> {
    if (!file) return undefined;

    const body = file.buffer;
    const key = nanoid();

    await this.client.putObject(
      this.bucketName,
      `raw/${key}`,
      body,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    await this.addToResizeMessageQueue(key);

    return key;
  }

  async deleteFile(key?: string) {
    if (!key) return false;

    try {
      await this.client.removeObject(this.bucketName, key);
      return true;
    } catch (error) {
      return false;
    }
  }
}
