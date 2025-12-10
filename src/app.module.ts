import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors';
import { WinstonModule } from 'nest-winston';
import { DBModule } from './db/db.module';
import { config, validationSchema, WinstonConfig } from './config';
import { WalletModule } from './modules/wallet/wallet.module';
import { KeyModule } from './modules/key/key.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
      validationSchema,
    }),
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const winstonConfig =
          config.getOrThrow<WinstonConfig>('logger.winston');
        return winstonConfig;
      },
    }),
    DBModule,
    AuthModule,
    KeyModule,
    WalletModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
