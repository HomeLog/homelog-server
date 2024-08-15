import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { nanoid } from 'nanoid';
import { setupMulterS3 } from 'src/common/utils/file.util';
import { StorageService } from './storage.service';

@Injectable()
export class S3Service implements StorageService {
  private bucketName: string;
  private client: S3Client;
  private readonly fileFieldsInterceptor;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get('AWS_REGION');
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');

    this.client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    this.bucketName =
      this.configService.get('AWS_S3_BUCKET_NAME') ?? 'default-bucket-name';

    if (!this.bucketName) {
      throw new Error('AWS S3 Bucket name is undefined.');
    }

    const multerOptions = setupMulterS3(this.configService);

    this.fileFieldsInterceptor = new (FileFieldsInterceptor(
      [
        { name: 'avatarImage', maxCount: 1 },
        { name: 'homeImage', maxCount: 1 },
      ],
      multerOptions,
    ))();
  }

  async uploadFile(
    file: Express.Multer.File | undefined,
  ): Promise<string | undefined> {
    if (!file) return undefined;

    const body = file.buffer;
    const key = nanoid();

    const uploadCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `raw/${key}`,
      Body: body,
      ContentType: file.mimetype,
    });

    await this.client.send(uploadCommand);

    return key;
  }

  async getPresignedUrl(key?: string) {
    if (!key) return undefined;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, {
        expiresIn: 60 * 60 * 24,
      });

      return url;
    } catch (error) {
      return undefined;
    }
  }

  async deleteFile(key?: string) {
    if (!key) return false;

    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.client.send(deleteCommand);
      return true;
    } catch (error) {
      return false;
    }
  }
}
