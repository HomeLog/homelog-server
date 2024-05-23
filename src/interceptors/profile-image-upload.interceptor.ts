import { UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { StorageEngine } from 'multer';

export default function ProfileImageUploadInterceptor({
  storage,
}: {
  storage: StorageEngine;
}) {
  return UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profileImage', maxCount: 1 },
        { name: 'homeImage', maxCount: 1 },
      ],
      {
        storage,
      },
    ),
  );
}
