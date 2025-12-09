import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthController } from './controllers';
import { GoogleAuthService } from './services';
import { GoogleStrategy } from './strategies';
import { TokenService } from './services/token.service';
import { IJwtConfig } from 'src/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const jwt = config.getOrThrow<IJwtConfig>('auth.jwt');
        return jwt;
      },
    }),
  ],
  controllers: [GoogleAuthController],
  providers: [GoogleAuthService, GoogleStrategy, JwtStrategy, TokenService],
  exports: [JwtStrategy],
})
export class AuthModule {}
