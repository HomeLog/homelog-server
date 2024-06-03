import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class ProfileImageUploadInterceptor implements NestInterceptor {
  //private readonly fileFieldsInterceptor;

  constructor(private readonly configService: ConfigService) {
    // const multerOptions = setupMulterS3(this.configService);
    // this.fileFieldsInterceptor = new (FileFieldsInterceptor(
    //   [
    //     { name: 'profileImage', maxCount: 1 },
    //     { name: 'homeImage', maxCount: 1 },
    //   ],
    //   multerOptions,
    // ))();
  }
  // async intercept(
  //   context: ExecutionContext,
  //   next: CallHandler,
  // ): Promise<Observable<any>> {
  //   return await this.fileFieldsInterceptor.intercept(context, next);
  // }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle();
  }
}
