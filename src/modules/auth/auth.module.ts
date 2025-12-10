import { Module } from '@nestjs/common';
import { GoogleStrategy, JwtStrategy } from './strategies';
import { AuthController } from './controllers';
import { AuthService } from './services';
import { GoogleModule } from 'src/integrations/google/google.module';
import { TokenModule } from 'src/integrations/token/token.module';
import {
  ApiKeyGuard,
  ApiKeyPermissionsGuard,
  CombinedAuthGuard,
  JWTAuthGuard,
} from './guards';

@Module({
  imports: [GoogleModule, TokenModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    JwtStrategy,
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
