import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AuthConfig } from './config/auth.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

const GLOBAL_PREFIX = 'api/v1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const authConfig = configService.get<AuthConfig>('auth')!;

  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.use(helmet());
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin: authConfig.corsOrigin,
    credentials: true,
  });

  if (process.env.NODE_ENV !== 'production') {
    const swaggerDocument = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Wealet API')
        .setDescription('Personal finance API built on an envelope/fund system')
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('api/docs', app, swaggerDocument);
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
