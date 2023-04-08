import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import getAppConfig from './config/envs/app.config';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    bufferLogs: true,
  });

  const appConfig = getAppConfig();
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  let logger: Logger | undefined = undefined;
  if (appConfig.NODE_ENV === 'production') {
    logger = app.get(Logger);
    app.useLogger(logger);
  }

  app.flushLogs();

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    methods: '*',
    exposedHeaders: ['NEW_AUTH_TOKEN'],
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(
    process.env.PORT || process.env.SERVER_PORT || '3000',
    process.env.HOST || process.env.SERVER_HOST || '0.0.0.0',
  );

  const msg = `Application is running on: ${await app.getUrl()}`;
  logger ? logger.log(msg) : console.log(msg);
}

bootstrap();
