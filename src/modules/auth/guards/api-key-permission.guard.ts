import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { IRequestWithUser } from 'src/common/types';
import * as sysMsg from 'src/common/system-messages';
import { API_KEY_PERMISSIONS_METADATA } from 'src/common/constants';

export const ApiKeyPermissions = (...permissions: string[]) =>
  SetMetadata(API_KEY_PERMISSIONS_METADATA, permissions);

@Injectable()
export class ApiKeyPermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const requiredPermissions: string[] =
      (Reflect.getMetadata(
        API_KEY_PERMISSIONS_METADATA,
        context.getHandler(),
      ) as string[]) || [];

    const request: IRequestWithUser = context.switchToHttp().getRequest();

    const perms: string[] = request.apiKeyPermissions || [];

    if (!perms.length) return true;

    const missing = requiredPermissions.some((p: string) => !perms.includes(p));

    if (missing) {
      throw new ForbiddenException(sysMsg.MISSING_PERMISSIONS);
    }

    return true;
  }
}
