import { BadRequestException, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import * as sysMsg from 'src/common/system-messages';
import * as constants from 'src/common/constants';

export class GoogleAuthGuard extends AuthGuard(constants.GOOGLE_AUTH_STRATEGY) {
  private readonly logger: Logger;
  constructor(@Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger) {
    super();
    this.logger = baseLogger.child({ context: GoogleAuthGuard.name });
  }

  handleRequest<TUser = any>(err: any, user: TUser): TUser {
    if (err) {
      this.logger.error(sysMsg.GOOGLE_AUTH_ERROR, err);
      throw new BadRequestException(
        sysMsg.GOOGLE_AUTHENTICATION_FAILED_INVALID_TOKEN,
      );
    }

    if (!user) {
      throw new BadRequestException(
        sysMsg.GOOGLE_AUTHENTICATION_FAILED_NO_USER,
      );
    }

    return user;
  }
}
