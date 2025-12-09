import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IJwtUser, IRequestWithUser } from 'src/common/types';
import { PrismaService } from 'src/db/prisma.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: IRequestWithUser<IJwtUser> = context
      .switchToHttp()
      .getRequest();
    const apiKey = String(request.headers['x-api-key'] || '').trim();

    if (!apiKey) throw new UnauthorizedException('Missing API key');

    const key = await this.prisma.key.findUnique({
      where: { api_key: apiKey },
      include: { user: true },
    });

    if (!key) throw new UnauthorizedException('Invalid API key');

    if (key.expires_at <= new Date()) {
      throw new UnauthorizedException('API key expired');
    }

    if (key.revoked) {
      throw new UnauthorizedException('API key revoked');
    }

    request.user = key.user;
    request.apiKeyPermissions = key.permissions;

    return true;
  }
}
