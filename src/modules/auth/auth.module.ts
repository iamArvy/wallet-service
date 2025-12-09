import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './strategies';
import { TokenService } from './services/token.service';
import { IJwtConfig } from 'src/config';
import { JWTAuthGuard } from './guards';
import { ApiKeyGuard } from './guards/api-key.guard';
import { CombinedAuthGuard } from './guards/combined.guard';
import { ApiKeyPermissionsGuard } from './guards/api-key-permission.guard';
import { AuthController } from './controllers';
import { AuthService } from './services';

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
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    JwtStrategy,
    TokenService,
    JWTAuthGuard,
    ApiKeyGuard,
    CombinedAuthGuard,
    ApiKeyPermissionsGuard,
  ],
  exports: [
    JwtStrategy,
    JWTAuthGuard,
    ApiKeyGuard,
    CombinedAuthGuard,
    ApiKeyPermissionsGuard,
  ],
})
export class AuthModule {}
