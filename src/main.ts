import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { SuccessInterceptor } from './common/interceptors/success-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('HomeLog API')
    .setDescription('HomeLog API 서버입니다.')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
      },
      'accessToken',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: configService.get('CORS_ORIGIN') ?? 'http://localhost:3000',
    credentials: true,
  });

  app.use(cookieParser());
  app.useGlobalInterceptors(new SuccessInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  await app.listen(configService.get('PORT') ?? 3001);
}
bootstrap();
