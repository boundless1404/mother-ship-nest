import { VersioningType } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import getAppConfig from './config/envs/app.config';
import { LoggerErrorInterceptor } from 'nestjs-pino';
import { Logger as NestLogger } from '@nestjs/common';
import { AllExceptionFilter } from './shared/allExceptionsHandler.exception';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    bufferLogs: true,
  });

  const appConfig = getAppConfig();
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // let logger: Logger | undefined = undefined;
  // if (appConfig.NODE_ENV === 'production') {
  //   logger = app.get(Logger);
  //   app.useLogger(logger);
  // }

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

  app.useGlobalFilters(new AllExceptionFilter(app.get(HttpAdapterHost)));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const port =
    process.env.PORT ||
    process.env.HTTP_PORT ||
    process.env.SERVER_PORT ||
    '3000';

  const host = process.env.SERVER_HOST;

  await app.listen(port, host, () => {
    NestLogger.log(host, `app started on port ${port}`);
    const httpServer = app.getHttpServer();

    // Get the router instance from the HTTP server
    const router = httpServer._events.request._router;

    const availableRoutes: [] = router.stack
      .map((layer) => {
        if (layer.route) {
          return {
            route: {
              path: layer.route?.path,
              method: layer.route?.stack[0].method,
            },
          };
        }
      })
      .filter((item) => item !== undefined);
    NestLogger.log(availableRoutes, 'Available routes');
  });

  const msg = `Application is running on: ${await app.getUrl()}`;
  // logger ? logger.log(msg) : console.log(msg);
  console.log(msg);
}

try {
  bootstrap();
} catch (err) {
  console.error('Error during bootstrap', err);
}
