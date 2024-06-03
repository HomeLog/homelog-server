import { S3Client } from '@aws-sdk/client-s3';
const multerS3 = require('multer-s3');
import { ConfigService } from '@nestjs/config';

export function setupMulterS3(configService: ConfigService) {
  const region = configService.get('AWS_REGION');
  const accessKeyId = configService.get('AWS_ACCESS_KEY_ID');
  const secretAccessKey = configService.get('AWS_SECRET_ACCESS_KEY');
  const bucketName = configService.get('AWS_S3_BUCKET_NAME');

  const s3 = new S3Client({
    region: region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });

  const storage = multerS3({
    s3: s3,
    bucket: bucketName,
    //acl: 'public-read',
    key: function (request, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  return {
    storage: storage,
    // limits: {
    //   fileSize: 10 * 1024 * 1024,
    //   fieldSize: 2 * 1024 * 1024,
    //   fields: 50,
    //   parts: 100,
    // },
  };
}

export async function getFilePath(
  file?: Express.Multer.File,
): Promise<string | undefined> {
  return file?.path;
}
