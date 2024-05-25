import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-providers';
import { ConfigService } from '@nestjs/config';
import { setupMulterS3 } from 'src/common/utils/file.util';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

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
        { name: 'profileImage', maxCount: 1 },
        { name: 'homeImage', maxCount: 1 },
      ],
      multerOptions,
    ))();
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    console.log('uploadFile');
    const { originalname, buffer } = file;
    const uploadCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `${Date.now()}-${originalname}`,
      Body: buffer,
    });
    const awsRegion = this.configService.get('AWS_REGION');

    await this.s3.send(uploadCommand);
    return `https://${this.bucketName}.s3.${awsRegion}.amazonaws.com/${uploadCommand.input.Key}`;
  }
}
