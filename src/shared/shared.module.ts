import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      async useFactory(configService: ConfigService) {
        await ConfigModule.envVariablesLoaded;

        return {
          signOptions: {
            expiresIn: configService.get('app.JWT_EXPIRY', '8h'),
          },
          secret: configService.get('app.JWT_SECRET'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [SharedService, JwtService],
  exports: [SharedService, JwtService],
})
export class SharedModule {}
