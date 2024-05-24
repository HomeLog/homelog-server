import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { S3Service } from 'src/users/storage/aws.service';

@Injectable()
export class ProfileImageUploadInterceptor implements NestInterceptor {
  constructor(private s3Service: S3Service) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const files = request.files;

    if (!files) {
      return next.handle();
    }

    const fileKeys = Object.keys(files);
    const uploadPromises = fileKeys.map((key) => {
      const file = files[key][0];
      return this.s3Service.uploadFile(file).then((url) => {
        request.body[`${key}Url`] = url;
      });
    });

    return from(Promise.all(uploadPromises)).pipe(
      switchMap(() => next.handle()),
    );
  }
}
