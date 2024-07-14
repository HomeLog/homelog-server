import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { nanoid } from 'nanoid';
import { setupMulterS3 } from 'src/common/utils/file.util';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucketName: string;
  private readonly fileFieldsInterceptor;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get('AWS_REGION');
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
    this.s3 = new S3Client({
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
    const contentType = file.originalname.split('.').pop()?.toLowerCase();
    const key = `${nanoid()}.${contentType}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.s3.send(uploadCommand);

    return key;
  }

  async deleteFile(key?: string) {
    if (!key) return false;

    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3.send(deleteCommand);
      return true;
    } catch (error) {
      return false;
    }
  }
}
