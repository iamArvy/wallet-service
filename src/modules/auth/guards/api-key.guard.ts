import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IJwtUser, IRequestWithUser } from 'src/common/types';
import { PrismaService } from 'src/db/prisma.service';
import * as sysMsg from 'src/common/system-messages';
import { API_KEY_HEADER } from 'src/common/constants';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: IRequestWithUser<IJwtUser> = context
      .switchToHttp()
      .getRequest();
    const apiKey = String(request.headers[API_KEY_HEADER] || '').trim();

    if (!apiKey) throw new UnauthorizedException(sysMsg.MISSING_API_KEY);

    const key = await this.prisma.key.findUnique({
      where: { api_key: apiKey },
      include: { user: true },
    });

    if (!key) throw new UnauthorizedException(sysMsg.INVALID_API_KEY);

    if (key.expires_at <= new Date()) {
      throw new UnauthorizedException(sysMsg.EXPIRED_API_KEY);
    }

    if (key.revoked) {
      throw new UnauthorizedException(sysMsg.REVOKED_API_KEY);
    }

    request.user = key.user;
    request.apiKeyPermissions = key.permissions;

    return true;
  }
}
