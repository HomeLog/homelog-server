import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-providers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: fromIni({ profile: 'default' }),
    });

    this.bucketName =
      this.configService.get('AWS_S3_BUCKET_NAME') ?? 'default-bucket-name';

    if (!this.bucketName) {
      throw new Error('AWS S3 Bucket name is undefined.');
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
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
