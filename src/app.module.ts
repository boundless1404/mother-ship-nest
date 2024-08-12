import {
  BadRequestException,
  Module,
  ValidationPipe,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/envs/app.config';
import awsConfig from './config/envs/aws.config';
import dataSourceInstance from './config/database/connections/default';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { first, has, values } from 'lodash';
import { LoggerModule } from 'nestjs-pino';
import helmet from 'helmet';
import { pathFromRoot } from './config/helpers/general';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { ExtractTokenMiddleWare } from './shared/extractToken.middleware';
import { ProjectModule } from './project/project.module';
import { WalletModule } from './wallet/wallet.module';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors');

const validator = new ValidationPipe({
  whitelist: false,
  transform: true,
  exceptionFactory(errors) {
    const formattedErrors = errors;
    // .reduce((prev, error) => {
    //   // if (!has(prev, error.property)) {
    //   //   prev[error.property] = first(values(error.constraints || {}));
    //   // }

    //   return prev;
    // }, {} as Record<string, string>);

    return new BadRequestException(
      {
        type: 'VALIDATION_ERROR',
        errors: formattedErrors,
        message: 'Invalid data',
      },
      'Bad Request',
    );
  },
});

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [appConfig.KEY],
      async useFactory(applicationConfig: ConfigType<typeof appConfig>) {
        const nodeEnv = applicationConfig.NODE_ENV;

        return {
          pinoHttp: {
            transport: {
              target: 'pino-pretty',
              options:
                nodeEnv === 'production'
                  ? {
                      destination: pathFromRoot('./logs/pm2/out.log'),
                      colorize: false,
                      mkdir: true,
                      crlf: true,
                    }
                  : undefined,
            },
          },
        };
      },
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [appConfig, awsConfig],
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      name: 'default',
      useFactory: () => ({}),
      dataSourceFactory: async () => {
        if (!dataSourceInstance.isInitialized) {
          dataSourceInstance.setOptions({ entities: ['dist/**/*.entity.js'] });
          await dataSourceInstance.initialize();
        }

        return dataSourceInstance;
      },
    }),
    // JwtModule.registerAsync({
    //   async useFactory(configService: ConfigService) {
    //     await ConfigModule.envVariablesLoaded;

    //     return {
    //       signOptions: {
    //         expiresIn: configService.get('app.JWT_EXPIRY', '8h'),
    //       },
    //       secret: configService.get('app.JWT_SECRET'),
    //     };
    //   },
    //   inject: [ConfigService],
    // }),
    AuthModule,
    SharedModule,
    ProjectModule,
    WalletModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: validator,
    },
    JwtService,
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cors(), helmet(), ExtractTokenMiddleWare)
      .exclude('/auth/*')
      .exclude('')
      .forRoutes('*');
  }
}
