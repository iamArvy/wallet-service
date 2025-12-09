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

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(
    private readonly jwtAuthGuard: JWTAuthGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    console.log(request);
    const authHeader = request.headers['authorization'];
    const apiKeyHeader = request.headers['x-api-key'];

    if (authHeader?.startsWith('Bearer ')) {
      const result = this.jwtAuthGuard.canActivate(context);
      return this.resolveGuardResult(result);
    }

    if (apiKeyHeader) {
      return await this.apiKeyGuard.canActivate(context);
    }

    throw new UnauthorizedException('No authentication provided');
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

    // It's an Observable → convert to Promise
    return await lastValueFrom(result);
  }
}
