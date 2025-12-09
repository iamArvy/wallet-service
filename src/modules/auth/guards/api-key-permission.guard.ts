import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Request } from 'express';
import { IRequestWithUser } from 'src/common/types';

export const ApiKeyPermissions = (...permissions: string[]) =>
  SetMetadata('apiKeyPermissions', permissions);

@Injectable()
export class ApiKeyPermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const requiredPermissions: string[] =
      (Reflect.getMetadata(
        'apiKeyPermissions',
        context.getHandler(),
      ) as string[]) || [];

    const request: IRequestWithUser = context.switchToHttp().getRequest();

    const perms: string[] = request.apiKeyPermissions || [];

    if (!perms.length) return true;

    const missing = requiredPermissions.some((p: string) => !perms.includes(p));

    if (missing) {
      throw new ForbiddenException('API key missing permission');
    }

    return true;
  }
}
