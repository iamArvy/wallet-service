import { BadRequestException, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

export interface OAuthTokenError {
  name: string;
  message: string;
  code?: string;
  status?: number;
  oauthError?: {
    data?: string;
  };
}

export interface OAuthInfo {
  message?: string;
}

export class GoogleAuthGuard extends AuthGuard('google') {
  private readonly logger: Logger;
  constructor(@Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger) {
    super();
    this.logger = baseLogger.child({ context: GoogleAuthGuard.name });
  }

  handleRequest<TUser = any>(err: any, user: TUser): TUser {
    if (err) {
      this.logger.error('Google Auth Guard Error', err);
      throw new BadRequestException(
        'Google authentication failed: Invalid Token',
      );
    }

    if (!user) {
      throw new BadRequestException(
        'Google authentication failed: No user found',
      );
    }

    return user;
  }
}
