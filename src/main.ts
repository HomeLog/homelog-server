import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SuccessInterceptor } from './common/success-response.interceptor';
import { GlobalExceptionFilter } from './exceptions/global-exception.filter';
import { AuthGuard } from './guard/auth.guard';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalInterceptors(new SuccessInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalGuards(new AuthGuard());
  await app.listen(3000);
}
bootstrap();
