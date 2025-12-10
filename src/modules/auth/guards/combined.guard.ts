import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JWTAuthGuard } from './jwt-auth.guard';
import { ApiKeyGuard } from './api-key.guard';
import { lastValueFrom, Observable } from 'rxjs';
import { Request } from 'express';
import {
  API_KEY_HEADER,
  JWT_KEY_HEADER,
  JWT_KEY_HEADER_PREFIX,
} from 'src/common/constants';
import { NO_AUTHENTICATION_PROVIDED } from 'src/common/system-messages';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(
    private readonly jwtAuthGuard: JWTAuthGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers[JWT_KEY_HEADER];
    const apiKeyHeader = request.headers[API_KEY_HEADER];

    if (authHeader?.startsWith(JWT_KEY_HEADER_PREFIX)) {
      const result = this.jwtAuthGuard.canActivate(context);
      return this.resolveGuardResult(result);
    }

    if (apiKeyHeader) {
      return await this.apiKeyGuard.canActivate(context);
    }

    throw new UnauthorizedException(NO_AUTHENTICATION_PROVIDED);
  }

  private async resolveGuardResult(
    result: boolean | Promise<boolean> | Observable<boolean>,
  ): Promise<boolean> {
    if (typeof result === 'boolean') {
      return result;
    }

    if (result instanceof Promise) {
      return await result;
    }

    return await lastValueFrom(result);
  }
}
